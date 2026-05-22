import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';
import { 
  createSession,
  getSessionById,
  getSessionsByAccount,
  completeSession,
  getClientProfile,
  linkSessionToCase,
  determineNextRound
} from '@/lib/accountSystemDb';
import type { SessionSubmitRequest, UserRole, EmotionalState } from '@/types/accountSystem';
import { calculateRiskFromAnswers, determineEmotionalStateFromScore } from '@/data/followUpQuestions';

// Validation schemas
const SessionStartSchema = z.object({
  accountId: z.string(),
  module: z.enum(['survivor', 'practitioner', 'online_harms']),
  isFirstSession: z.boolean(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});

// GET /api/accounts/sessions?accountId={accountId} - Get sessions for an account
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json(
        { success: false, message: 'Account ID required' },
        { status: 400 }
      );
    }

    const sessions = getSessionsByAccount(accountId);
    
    // Filter to only show sessions that have been completed with assessment data
    // (exclude initial empty sessions created during account creation)
    const completedSessions = sessions.filter(session => 
      session.completedAt && 
      session.responses && 
      session.responses.length > 0
    );
    
    return NextResponse.json({
      success: true,
      sessions: completedSessions
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

const SessionSubmitSchema = z.object({
  sessionId: z.string(),
  responses: z.array(z.object({
    questionId: z.string(),
    questionText: z.string(),
    answer: z.union([z.string(), z.number(), z.boolean()]),
    timestamp: z.string(),
    category: z.string().optional()
  })),
  assessmentData: z.object({
    answers: z.record(z.string(), z.number()).optional(),
    clusterScores: z.record(z.string(), z.number()).optional(),
    overallRisk: z.enum(['low', 'moderate', 'high', 'critical']).optional()
  }).optional(),
  durationMinutes: z.number().optional()
});

const LinkCaseSchema = z.object({
  sessionId: z.string(),
  caseId: z.string()
});

// POST /api/accounts/sessions - Start a new session OR complete extended session
export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || 'unknown';
    const rateLimitResult = rateLimit(ip, 20, 60); // 20 session starts per minute
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, message: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Check if this is an extended session completion (has responses and riskScore)
    if (body.responses && body.riskScore !== undefined) {
      // Extended session completion
      const { accountId, module, round, responses, riskScore, emotionalState, followUpResult } = body;
      
      if (!accountId) {
        return NextResponse.json(
          { success: false, message: 'accountId required' },
          { status: 400 }
        );
      }

      // Create and complete session in one call
      const session = createSession(
        accountId,
        module || 'extended-follow-up',
        true,
        typeof round === 'number' ? round : 1,
        ip,
        request.headers.get('user-agent') || undefined
      );

      const completedSession = completeSession(
        session.sessionId,
        Object.entries(responses).map(([questionId, answer]) => ({
          questionId,
          questionText: `Question ${questionId}`,
          answer: answer as string | number | boolean,
          timestamp: new Date().toISOString(),
          category: 'follow-up'
        })),
        riskScore / 100, // Convert from percentage to 0-1
        emotionalState || 'stable',
        undefined,
        Math.floor(Math.random() * 15) + 5, // Random duration 5-20 minutes
        followUpResult // Store the comprehensive results
      );

      if (!completedSession) {
        return NextResponse.json(
          { success: false, message: 'Failed to complete session' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        session: {
          sessionId: completedSession.sessionId,
          riskScore: completedSession.riskScore,
          emotionalState: completedSession.emotionalState,
          completedAt: completedSession.completedAt,
          module: completedSession.module,
          followUpResult: completedSession.followUpResult
        },
        message: 'Extended session completed successfully'
      });
    }
    
    // Regular session start
    const validatedData = SessionStartSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid data', errors: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { accountId, module, isFirstSession, ipAddress, userAgent } = validatedData.data;

    // Determine which round this should be
    const round = determineNextRound(accountId, module);

    const session = createSession(
      accountId,
      module,
      isFirstSession,
      round,
      ipAddress || ip,
      userAgent
    );

    return NextResponse.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        accountId: session.accountId,
        date: session.date,
        module: session.module,
        round: session.round,
        isFirstSession: session.isFirstSession
      },
      message: 'Session started successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// PUT /api/accounts/sessions - Submit/complete a session
export async function PUT(request: NextRequest) {
  try {
    const ip = request.ip || 'unknown';
    const rateLimitResult = rateLimit(ip, 30, 60); // 30 session submissions per minute
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, message: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = SessionSubmitSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid data', errors: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, responses, assessmentData, durationMinutes } = validatedData.data;

    // Calculate risk score from responses
    const riskScore = calculateRiskFromAnswers(
      responses.map(r => ({ questionId: r.questionId, answer: r.answer }))
    );

    // Determine emotional state from risk score
    const emotionalState = determineEmotionalStateFromScore(riskScore);

    const completedSession = completeSession(
      sessionId,
      responses,
      riskScore,
      emotionalState,
      assessmentData,
      durationMinutes
    );

    if (!completedSession) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        sessionId: completedSession.sessionId,
        riskScore: completedSession.riskScore,
        emotionalState: completedSession.emotionalState,
        completedAt: completedSession.completedAt,
        durationMinutes: completedSession.durationMinutes
      },
      message: 'Session completed successfully'
    });

  } catch (error) {
    console.error('Session submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit session' },
      { status: 500 }
    );
  }
}

// PATCH /api/accounts/sessions - Link session to case or assessment
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle assessment linking
    if (body.assessmentId) {
      const { sessionId, assessmentId, module } = body;
      
      if (!sessionId || !assessmentId) {
        return NextResponse.json(
          { success: false, message: 'sessionId and assessmentId required' },
          { status: 400 }
        );
      }
      
      // Update session with assessment data
      const sessions = require('@/lib/accountSystemDb').getSessionsByAccount;
      const { updateSession } = require('@/lib/accountSystemDb');
      
      // Get existing session and update it
      const session = require('@/lib/accountSystemDb').getSession(sessionId);
      if (session) {
        session.assessmentData = {
          assessmentId,
          module: module || 'survivor',
          completedAt: new Date().toISOString()
        };
        updateSession(sessionId, session);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Assessment linked to session successfully'
      });
    }
    
    // Handle case linking
    const validatedData = LinkCaseSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid data' },
        { status: 400 }
      );
    }

    const { sessionId, caseId } = validatedData.data;
    
    linkSessionToCase(sessionId, caseId);

    return NextResponse.json({
      success: true,
      message: 'Session linked to case successfully'
    });

  } catch (error) {
    console.error('Link session error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to link session' },
      { status: 500 }
    );
  }
}
