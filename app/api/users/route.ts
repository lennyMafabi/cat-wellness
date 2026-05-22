import { NextRequest, NextResponse } from 'next/server';
import { getUsers, createUser } from '@/lib/db';
import { UserCreateSchema, safeValidate } from '@/lib/validation';

export async function GET() {
  try {
    const users = getUsers();
    // Don't return passwords
    const safeUsers = users.map(u => ({
      id: u.id,
      username: u.username,
      role: u.role,
      createdAt: u.createdAt
    }));
    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    console.error('Users GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Validate user creation data
    const validation = safeValidate(UserCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid user data', details: validation.errors },
        { status: 400 }
      );
    }
    
    const { username, password, role } = validation.data;
    
    const user = createUser(username, password, role || 'staff');
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Users POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
