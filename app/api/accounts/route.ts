import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';
import { 
  createAccount, 
  authenticateAccount, 
  getAccountById,
  getAllAccounts,
  getLastSessionByAccount,
  createSession,
  completeSession,
  shouldShowQuickReassessment,
  determineNextRound,
  getSessionsByAccount,
  updateAccount
} from '@/lib/accountSystemDb';
import type { CreateAccountRequest, LoginRequest, SessionSubmitRequest, UserRole } from '@/types/accountSystem';

// Validation schemas
const CreateAccountSchema = z.object({
  username: z.string().min(3).max(50),
  alias: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(['survivor', 'practitioner', 'online_harms']),
  password: z.string().min(6),
  consentGiven: z.boolean(),
  preferredLanguage: z.string().optional()
});

const LoginSchema = z.object({
  username: z.string(),
  password: z.string()
});

const SessionStartSchema = z.object({
  accountId: z.string(),
  module: z.enum(['survivor', 'practitioner', 'online_harms']),
  isFirstSession: z.boolean(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});

// GET /api/accounts - Get all accounts (admin only)
export async function GET(request: NextRequest) {
  try {
    const accounts = getAllAccounts();
    
    // Return sanitized account data (without password hashes)
    const sanitizedAccounts = accounts.map(acc => ({
      accountId: acc.accountId,
      username: acc.username,
      alias: acc.alias,
      email: acc.email,
      phone: acc.phone,
      role: acc.role,
      status: acc.status,
      createdAt: acc.createdAt,
      lastLoginAt: acc.lastLoginAt,
      totalSessions: acc.totalSessions,
      metadata: acc.metadata
    }));
    
    return NextResponse.json({
      success: true,
      accounts: sanitizedAccounts
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch accounts' },
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
  riskScore: z.number().min(0).max(1),
  emotionalState: z.enum(['calm', 'distressed', 'high_risk', 'critical']),
  assessmentData: z.object({
    answers: z.record(z.string(), z.number()).optional(),
    clusterScores: z.record(z.string(), z.number()).optional(),
    overallRisk: z.enum(['low', 'moderate', 'high', 'critical']).optional()
  }).optional(),
  durationMinutes: z.number().optional()
});

// POST /api/accounts - Create new account
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || 'unknown';
    const rateLimitResult = rateLimit(ip, 5, 60); // 5 attempts per minute
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = CreateAccountSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid input data', errors: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { username, alias, phone, email, role, password, consentGiven, preferredLanguage } = validatedData.data;

    // Create account
    const account = createAccount(
      username,
      password,
      role,
      consentGiven,
      alias,
      phone,
      email,
      preferredLanguage
    );

    // Create initial session
    const session = createSession(
      account.accountId,
      role,
      true, // isFirstSession
      1, // First round
      ip,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      account: {
        accountId: account.accountId,
        username: account.username,
        alias: account.alias,
        role: account.role,
        status: account.status,
        createdAt: account.createdAt,
        metadata: account.metadata
      },
      session: {
        sessionId: session.sessionId,
        round: session.round,
        isFirstSession: session.isFirstSession
      },
      isReturningUser: false,
      message: 'Account created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Account creation error:', error);
    
    if (error instanceof Error && error.message === 'Username already exists') {
      return NextResponse.json(
        { success: false, message: 'Username already exists. Please choose a different username.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to create account' },
      { status: 500 }
    );
  }
}

// PUT /api/accounts - Login
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || 'unknown';
    const rateLimitResult = rateLimit(ip, 10, 60); // 10 login attempts per minute
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, message: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = LoginSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid login credentials' },
        { status: 400 }
      );
    }

    const { username, password } = validatedData.data;

    // Authenticate
    const account = authenticateAccount(username, password);
    
    if (!account) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Check if returning user
    const sessions = getSessionsByAccount(account.accountId);
    const isReturningUser = sessions.length > 0;
    const lastSession = getLastSessionByAccount(account.accountId);
    
    // Determine what to show
    let showQuickReassessment = false;
    let nextRound = 1;
    
    if (isReturningUser) {
      showQuickReassessment = shouldShowQuickReassessment(account.accountId);
      
      if (!showQuickReassessment && !account.metadata?.firstIntakeComplete) {
        // Continue first intake
        nextRound = determineNextRound(account.accountId, account.role);
      } else if (showQuickReassessment) {
        // Show quick reassessment
        nextRound = 1; // Quick check-in uses round 1 format but shorter
      } else {
        // Continue follow-up rounds
        nextRound = determineNextRound(account.accountId, account.role);
      }
    }

    // Create new session for this login
    const newSession = createSession(
      account.accountId,
      account.role,
      !isReturningUser,
      nextRound,
      ip,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      account: {
        accountId: account.accountId,
        username: account.username,
        alias: account.alias,
        role: account.role,
        status: account.status,
        totalSessions: account.totalSessions,
        metadata: account.metadata
      },
      session: {
        sessionId: newSession.sessionId,
        round: newSession.round,
        isFirstSession: newSession.isFirstSession
      },
      isReturningUser,
      showQuickReassessment,
      lastSession: lastSession ? {
        sessionId: lastSession.sessionId,
        date: lastSession.date,
        riskScore: lastSession.riskScore,
        emotionalState: lastSession.emotionalState,
        round: lastSession.round
      } : undefined,
      message: isReturningUser ? 'Welcome back!' : 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}

// PATCH /api/accounts - Update account (e.g., mark first intake complete)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, updates } = body;
    
    if (!accountId || !updates) {
      return NextResponse.json(
        { success: false, message: 'Account ID and updates required' },
        { status: 400 }
      );
    }

    const account = getAccountById(accountId);
    if (!account) {
      return NextResponse.json(
        { success: false, message: 'Account not found' },
        { status: 404 }
      );
    }

    // Apply updates
    if (updates.metadata) {
      account.metadata = { ...account.metadata, ...updates.metadata };
    }
    
    if (updates.phone) account.phone = updates.phone;
    if (updates.email) account.email = updates.email;
    if (updates.alias) account.alias = updates.alias;

    updateAccount(account);

    return NextResponse.json({
      success: true,
      message: 'Account updated successfully',
      account: {
        accountId: account.accountId,
        username: account.username,
        metadata: account.metadata
      }
    });

  } catch (error) {
    console.error('Update account error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update account' },
      { status: 500 }
    );
  }
}
