import { NextRequest, NextResponse } from 'next/server';
import { 
  createClient, 
  createCase, 
  addEvidence,
  getClientById
} from '@/lib/onlineHarmsDb';
import { OnlineHarmsReportSchema, LimitedModeReportSchema, safeValidate } from '@/lib/validation/onlineHarms';
import { hashForLogging } from '@/lib/security';

// In-memory rate limiting
const reportCounts = new Map<string, { count: number; resetTime: number }>();
const MAX_REPORTS_PER_HOUR = 100;
const HOUR_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = reportCounts.get(ip);
  
  if (!record || now > record.resetTime) {
    reportCounts.set(ip, { count: 1, resetTime: now + HOUR_MS });
    return true;
  }
  
  if (record.count >= MAX_REPORTS_PER_HOUR) {
    return false;
  }
  
  record.count += 1;
  return true;
}

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || undefined;
  
  try {
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many reports. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Check if this is limited mode (no consent)
    const isLimitedMode = !body.consentGiven;
    
    if (isLimitedMode) {
      // Validate limited mode report
      const validation = safeValidate(LimitedModeReportSchema, body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid report data', details: validation.errors },
          { status: 400 }
        );
      }
      
      // In limited mode, we don't store anything, just return guidance
      return NextResponse.json({
        success: true,
        mode: 'limited',
        message: 'Report received in limited mode. No data has been stored.',
        guidance: {
          immediateSteps: [
            'Document all evidence (screenshots, messages)',
            'Do not delete anything from your device',
            'Contact a trusted friend or family member',
            'Consider reporting to the platform where the incident occurred'
          ],
          supportResources: [
            'Local cybercrime reporting center',
            'Platform safety centers (Facebook, Instagram, etc.)',
            'Legal aid organizations'
          ]
        }
      });
    }
    
    // Full mode with consent - validate full schema
    const validation = safeValidate(OnlineHarmsReportSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid report data', details: validation.errors },
        { status: 400 }
      );
    }
    
    const data = validation.data;
    
    // Create or get client
    let clientId = data.clientId;
    if (!clientId) {
      // Create new client
      const client = createClient(
        data.fullName,
        data.phone,
        data.email,
        true, // consentGiven
        ip,
        userAgent
      );
      clientId = client.clientId;
    } else {
      // Verify existing client exists
      const existingClient = getClientById(clientId);
      if (!existingClient) {
        return NextResponse.json(
          { error: 'Invalid client ID' },
          { status: 400 }
        );
      }
      if (!existingClient.consentGiven) {
        return NextResponse.json(
          { error: 'Client has not given consent for data storage' },
          { status: 403 }
        );
      }
    }
    
    // Determine risk level from assessment if available
    const riskLevel = data.assessmentResult?.overallRisk === 'critical' ? 'critical' :
                      data.assessmentResult?.overallRisk === 'high' ? 'high' :
                      data.assessmentResult?.overallRisk === 'moderate' ? 'medium' : 'low';
    
    // Create case with assessment data
    const newCase = createCase(
      clientId,
      riskLevel,
      data.tfgbvType,
      data.description,
      data.platforms,
      undefined, // assignedTo
      data.assessmentAnswers,
      data.assessmentResult
    );
    
    // Add evidence if provided
    const evidenceIds: string[] = [];
    if (data.evidence && data.evidence.length > 0) {
      for (const ev of data.evidence) {
        const evidence = addEvidence(
          newCase.caseId,
          clientId,
          ev.type,
          ev.content,
          ev.filename,
          ev.mimeType,
          undefined, // size
          ev.tags || [],
          undefined // description
        );
        evidenceIds.push(evidence.evidenceId);
      }
    }
    
    // Log anonymized submission
    console.log(`Online Harms report submitted from IP: ${hashForLogging(ip)}`);
    
    return NextResponse.json({
      success: true,
      mode: 'full',
      clientId,
      caseId: newCase.caseId,
      message: 'Report submitted successfully. A support specialist will review your case.',
      caseReference: newCase.caseId.slice(0, 8).toUpperCase(), // Short reference for user
      nextSteps: [
        'Save your case reference number',
        'Check your phone/email for updates if provided',
        'A support specialist will contact you within 24-48 hours'
      ]
    });
    
  } catch (error) {
    console.error('Online Harms report error:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}
