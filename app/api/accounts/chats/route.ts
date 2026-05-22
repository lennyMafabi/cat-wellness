import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { 
  createRetainedChat,
  addMessageToRetainedChat,
  endRetainedChat,
  getChatsByAccount,
  getChatsBySession
} from '@/lib/accountSystemDb';
import type { RetainedMessage } from '@/types/accountSystem';

// POST /api/accounts/chats - Create new chat or add message
export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || 'unknown';
    const rateLimitResult = rateLimit(ip, 100, 60); // 100 chat operations per minute
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, message: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { action, accountId, sessionId, module, chatId, role, content, sentiment, summary } = body;

    switch (action) {
      case 'create':
        if (!accountId || !sessionId || !module) {
          return NextResponse.json(
            { success: false, message: 'accountId, sessionId, and module required' },
            { status: 400 }
          );
        }
        const newChat = createRetainedChat(accountId, sessionId, module);
        return NextResponse.json({
          success: true,
          chat: newChat,
          message: 'Chat created'
        }, { status: 201 });

      case 'add_message':
        if (!chatId || !role || !content) {
          return NextResponse.json(
            { success: false, message: 'chatId, role, and content required' },
            { status: 400 }
          );
        }
        addMessageToRetainedChat(chatId, role as 'user' | 'assistant' | 'system', content, sentiment);
        return NextResponse.json({
          success: true,
          message: 'Message added'
        });

      case 'end':
        if (!chatId) {
          return NextResponse.json(
            { success: false, message: 'chatId required' },
            { status: 400 }
          );
        }
        endRetainedChat(chatId, summary);
        return NextResponse.json({
          success: true,
          message: 'Chat ended'
        });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, message: 'Chat operation failed' },
      { status: 500 }
    );
  }
}

// GET /api/accounts/chats?accountId={id} or ?sessionId={id} - Get chats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const sessionId = searchParams.get('sessionId');

    if (accountId) {
      const chats = getChatsByAccount(accountId);
      return NextResponse.json({
        success: true,
        chats: chats.map(chat => ({
          chatId: chat.chatId,
          sessionId: chat.sessionId,
          module: chat.module,
          startedAt: chat.startedAt,
          endedAt: chat.endedAt,
          messageCount: chat.messages.length,
          summary: chat.summary
        })),
        total: chats.length
      });
    }

    if (sessionId) {
      const chats = getChatsBySession(sessionId);
      return NextResponse.json({
        success: true,
        chats: chats.map(chat => ({
          chatId: chat.chatId,
          accountId: chat.accountId,
          module: chat.module,
          startedAt: chat.startedAt,
          endedAt: chat.endedAt,
          messageCount: chat.messages.length,
          summary: chat.summary
        })),
        total: chats.length
      });
    }

    return NextResponse.json(
      { success: false, message: 'accountId or sessionId required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Get chats error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve chats' },
      { status: 500 }
    );
  }
}
