import { NextRequest, NextResponse } from 'next/server';
import { findUser } from '@/lib/db';
import { AuthSchema, safeValidate } from '@/lib/validation';

// In-memory rate limiting (use Redis in production)
const loginAttempts = new Map<string, { count: number; lockedUntil: number | null }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function getClientId(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

function isLocked(clientId: string): boolean {
  const attempts = loginAttempts.get(clientId);
  if (!attempts?.lockedUntil) return false;
  if (Date.now() < attempts.lockedUntil) return true;
  loginAttempts.delete(clientId);
  return false;
}

function recordAttempt(clientId: string): void {
  const current = loginAttempts.get(clientId) || { count: 0, lockedUntil: null };
  current.count += 1;
  if (current.count >= MAX_ATTEMPTS) {
    current.lockedUntil = Date.now() + LOCKOUT_DURATION;
  }
  loginAttempts.set(clientId, current);
}

function resetAttempts(clientId: string): void {
  loginAttempts.delete(clientId);
}

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  
  try {
    if (isLocked(clientId)) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please try again later.' },
        { status: 429 }
      );
    }
    
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    const validation = safeValidate(AuthSchema, body);
    if (!validation.success) {
      recordAttempt(clientId);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const { username, password } = validation.data;
    const user = findUser(username);
    
    if (!user || user.password !== password) {
      recordAttempt(clientId);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    resetAttempts(clientId);
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
