import { NextRequest, NextResponse } from 'next/server';
import { resetPassword, getAccountById } from '@/lib/accountSystemDb';

// POST /api/accounts/reset-password - Reset password for an account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { success: false, message: 'Account ID required' },
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

    const result = resetPassword(accountId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to reset password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      tempPassword: result.tempPassword
    });

  } catch (error) {
    console.error('Password reset error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: 'Failed to reset password: ' + errorMessage },
      { status: 500 }
    );
  }
}
