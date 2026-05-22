import { NextRequest, NextResponse } from 'next/server';
import { getAllAccounts } from '@/lib/accountSystemDb';
import { writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const PASSWORD_RESET_REQUESTS_PATH = join(DATA_DIR, 'password-reset-requests.json');

interface PasswordResetRequest {
  requestId: string;
  accountId: string;
  username: string;
  email?: string;
  phone?: string;
  requestedAt: string;
  status: 'pending' | 'completed';
  completedAt?: string;
  tempPassword?: string;
}

async function readPasswordResetRequests(): Promise<PasswordResetRequest[]> {
  try {
    if (!existsSync(PASSWORD_RESET_REQUESTS_PATH)) {
      return [];
    }
    const data = await readFile(PASSWORD_RESET_REQUESTS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writePasswordResetRequests(requests: PasswordResetRequest[]): Promise<void> {
  await writeFile(PASSWORD_RESET_REQUESTS_PATH, JSON.stringify(requests, null, 2), 'utf-8');
}

// POST /api/accounts/forgot-password - Submit a password reset request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { success: false, message: 'Username is required' },
        { status: 400 }
      );
    }

    // Find account by username
    const accounts = getAllAccounts();
    const account = accounts.find(a => a.username.toLowerCase() === username.toLowerCase());

    if (!account) {
      return NextResponse.json(
        { success: false, message: 'Account not found' },
        { status: 404 }
      );
    }

    // Check if there's already a pending request
    const requests = await readPasswordResetRequests();
    const existingPending = requests.find(
      r => r.accountId === account.accountId && r.status === 'pending'
    );

    if (existingPending) {
      return NextResponse.json(
        { success: false, message: 'A password reset request is already pending for this account. Please wait for admin to process it.' },
        { status: 400 }
      );
    }

    // Create new request
    const newRequest: PasswordResetRequest = {
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      accountId: account.accountId,
      username: account.username,
      email: account.email,
      phone: account.phone,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };

    requests.push(newRequest);
    await writePasswordResetRequests(requests);

    return NextResponse.json({
      success: true,
      message: 'Password reset request submitted successfully',
      requestId: newRequest.requestId
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit password reset request' },
      { status: 500 }
    );
  }
}

// GET /api/accounts/forgot-password - Get all pending requests (for admin)
export async function GET(request: NextRequest) {
  try {
    const requests = await readPasswordResetRequests();
    const pendingRequests = requests.filter(r => r.status === 'pending');

    return NextResponse.json({
      success: true,
      requests: pendingRequests
    });

  } catch (error) {
    console.error('Get password reset requests error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch password reset requests' },
      { status: 500 }
    );
  }
}
