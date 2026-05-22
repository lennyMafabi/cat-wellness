import { NextRequest, NextResponse } from 'next/server';
import { getAssessments, saveAssessment, searchAssessments, deleteAssessment } from '@/lib/db';
import { AssessmentSubmissionSchema, SearchParamsSchema, safeValidate, IdParamSchema } from '@/lib/validation';
import { hashForLogging } from '@/lib/security';

// Max assessments per IP to prevent spam
const assessmentCounts = new Map<string, { count: number; resetTime: number }>();
const MAX_ASSESSMENTS_PER_HOUR = 10;
const HOUR_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = assessmentCounts.get(ip);
  
  if (!record || now > record.resetTime) {
    assessmentCounts.set(ip, { count: 1, resetTime: now + HOUR_MS });
    return true;
  }
  
  if (record.count >= MAX_ASSESSMENTS_PER_HOUR) {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = {
      q: searchParams.get('q') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
    };
    
    // Validate search parameters
    const validation = safeValidate(SearchParamsSchema, rawParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters' },
        { status: 400 }
      );
    }
    
    const { q: query, from: dateFrom, to: dateTo } = validation.data;
    
    if (query || dateFrom || dateTo) {
      const results = searchAssessments(query || '', dateFrom, dateTo);
      return NextResponse.json({ assessments: results });
    }
    
    const assessments = getAssessments();
    return NextResponse.json({ 
      assessments: assessments.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ) 
    });
  } catch (error) {
    console.error('Assessment GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  
  try {
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many assessments. Please try again later.' },
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
    
    // Validate assessment data
    const validation = safeValidate(AssessmentSubmissionSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid assessment data', details: validation.errors },
        { status: 400 }
      );
    }
    
    // Log anonymized submission
    console.log(`Assessment submitted from IP: ${hashForLogging(ip)}`);
    
    const assessment = saveAssessment(validation.data);
    return NextResponse.json({ success: true, assessment });
  } catch (error) {
    console.error('Assessment POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    // Validate ID format (UUID)
    const idValidation = safeValidate(IdParamSchema, id);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    const deleted = deleteAssessment(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Assessment DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
