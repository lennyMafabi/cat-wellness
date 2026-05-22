import { NextRequest, NextResponse } from 'next/server';
import {
  getClientSummaries,
  getAllCases,
  getCaseDetail,
  updateCaseStatus,
  addAdminNote,
  linkWellnessAssessment,
  deleteClient,
  getDashboardStats
} from '@/lib/onlineHarmsDb';
import { UpdateCaseStatusSchema, AdminNoteSchema, WellnessReferralSchema, safeValidate } from '@/lib/validation/onlineHarms';

// Helper to get client IP
function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

// GET - Fetch dashboard data, clients, or cases
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const ip = getClientIp(request);
    
    // Get dashboard stats
    if (action === 'stats') {
      const stats = getDashboardStats();
      return NextResponse.json({ success: true, stats });
    }
    
    // Get client list
    if (action === 'clients') {
      const clients = getClientSummaries();
      return NextResponse.json({ success: true, clients });
    }
    
    // Get all cases
    if (action === 'cases') {
      const cases = getAllCases();
      return NextResponse.json({ success: true, cases });
    }
    
    // Get case detail
    if (action === 'case-detail') {
      const caseId = searchParams.get('caseId');
      const adminUsername = searchParams.get('admin') || 'unknown';
      
      if (!caseId) {
        return NextResponse.json({ error: 'Case ID required' }, { status: 400 });
      }
      
      const caseDetail = getCaseDetail(caseId, adminUsername, ip);
      if (!caseDetail) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 });
      }
      
      // Check consent - if no consent, hide sensitive data
      if (!caseDetail.consentGiven) {
        return NextResponse.json({
          success: true,
          case: {
            ...caseDetail,
            clientAlias: 'Anonymous (No Consent)',
            evidence: [],
            adminNotes: [],
            warning: 'User did not consent to data storage'
          }
        });
      }
      
      return NextResponse.json({ success: true, case: caseDetail });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Online Harms Admin GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Update case status, add notes, link wellness assessment
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    const { action } = body;
    
    // Update case status
    if (action === 'updateStatus') {
      const validation = safeValidate(UpdateCaseStatusSchema, body);
      if (!validation.success) {
        return NextResponse.json({ error: 'Invalid data', details: validation.errors }, { status: 400 });
      }
      
      const updated = updateCaseStatus(
        validation.data.caseId,
        validation.data.status,
        validation.data.assignedTo
      );
      
      if (!updated) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, case: updated });
    }
    
    // Add admin note
    if (action === 'addNote') {
      const validation = safeValidate(AdminNoteSchema, body);
      if (!validation.success) {
        return NextResponse.json({ error: 'Invalid data', details: validation.errors }, { status: 400 });
      }
      
      const note = addAdminNote(
        validation.data.caseId,
        body.adminUsername || 'unknown',
        validation.data.note
      );
      
      return NextResponse.json({ success: true, note });
    }
    
    // Link wellness assessment
    if (action === 'linkWellness') {
      const validation = safeValidate(WellnessReferralSchema, body);
      if (!validation.success) {
        return NextResponse.json({ error: 'Invalid data', details: validation.errors }, { status: 400 });
      }
      
      linkWellnessAssessment(validation.data.caseId, validation.data.assessmentId);
      
      return NextResponse.json({ success: true, message: 'Wellness assessment linked' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Online Harms Admin POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE - Delete client and all data
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }
    
    const deleted = deleteClient(clientId);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Client and all associated data deleted' 
    });
    
  } catch (error) {
    console.error('Online Harms Admin DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
