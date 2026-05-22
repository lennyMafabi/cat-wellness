import { NextRequest, NextResponse } from 'next/server';
import { 
  getChatSessions, 
  getChatMessages, 
  createChatSession, 
  addChatMessage, 
  markMessagesAsRead,
  closeChatSession
} from '@/lib/db';
import { ChatActionSchema, safeValidate, IdParamSchema } from '@/lib/validation';

// Message rate limiting per session
const messageCounts = new Map<string, { count: number; resetTime: number }>();
const MAX_MESSAGES_PER_MINUTE = 10;
const MINUTE_MS = 60 * 1000;

function checkMessageRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const record = messageCounts.get(sessionId);
  
  if (!record || now > record.resetTime) {
    messageCounts.set(sessionId, { count: 1, resetTime: now + MINUTE_MS });
    return true;
  }
  
  if (record.count >= MAX_MESSAGES_PER_MINUTE) {
    return false;
  }
  
  record.count += 1;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (sessionId) {
      // Validate UUID format
      const idValidation = safeValidate(IdParamSchema, sessionId);
      if (!idValidation.success) {
        return NextResponse.json(
          { error: 'Invalid session ID' },
          { status: 400 }
        );
      }
      
      const messages = getChatMessages(sessionId);
      return NextResponse.json({ messages });
    }
    
    const sessions = getChatSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Chat GET error:', error);
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
    
    // Validate action data
    const validation = safeValidate(ChatActionSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid chat action', details: validation.errors },
        { status: 400 }
      );
    }
    
    const data = validation.data;
    
    if (data.action === 'createSession') {
      const session = createChatSession(data.userName, data.userPhone, data.assessmentId);
      return NextResponse.json({ success: true, session });
    }
    
    if (data.action === 'sendMessage') {
      // Check rate limit for this session
      if (!checkMessageRateLimit(data.sessionId)) {
        return NextResponse.json(
          { error: 'Too many messages. Please slow down.' },
          { status: 429 }
        );
      }
      
      const msg = addChatMessage(data.sessionId, data.message, data.sender, data.staffName);
      return NextResponse.json({ success: true, message: msg });
    }
    
    if (data.action === 'markRead') {
      markMessagesAsRead(data.sessionId);
      return NextResponse.json({ success: true });
    }
    
    if (data.action === 'closeSession') {
      closeChatSession(data.sessionId);
      return NextResponse.json({ success: true });
    }
    
    // Unreachable due to schema validation, but for safety
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Chat POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
