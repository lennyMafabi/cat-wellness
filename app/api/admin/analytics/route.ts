import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { 
  getAllAdminMirrors,
  getClientProfile,
  getSystemAnalytics,
  getAccountById,
  getChatsByAccount
} from '@/lib/accountSystemDb';
import type { SystemAnalytics, ClientProfile } from '@/types/accountSystem';

// GET /api/admin/analytics - Get system-wide analytics
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || 'unknown';
    const rateLimitResult = rateLimit(ip, 60, 60); // 60 requests per minute
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, message: 'Too many requests' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const clientId = searchParams.get('clientId');

    switch (type) {
      case 'overview':
        return getOverviewAnalytics();
      
      case 'clients':
        return getClientsList();
      
      case 'client-profile':
        if (!clientId) {
          return NextResponse.json(
            { success: false, message: 'Client ID required' },
            { status: 400 }
          );
        }
        return getClientDetailedProfile(clientId);
      
      case 'risk-timeline':
        if (!clientId) {
          return NextResponse.json(
            { success: false, message: 'Client ID required' },
            { status: 400 }
          );
        }
        return getClientRiskTimeline(clientId);
      
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid analytics type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve analytics' },
      { status: 500 }
    );
  }
}

// System overview analytics
async function getOverviewAnalytics() {
  const analytics = getSystemAnalytics();
  const mirrors = getAllAdminMirrors();

  // Calculate additional metrics
  const activeClientsLast24h = mirrors.filter(m => {
    const lastActivity = new Date(m.lastActivityAt);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return lastActivity >= yesterday;
  }).length;

  const highRiskClients = mirrors.filter(m => 
    m.currentRiskLevel === 'high' || m.currentRiskLevel === 'critical'
  ).length;

  const newClientsThisWeek = mirrors.filter(m => {
    const created = new Date(m.createdAt);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return created >= weekAgo;
  }).length;

  return NextResponse.json({
    success: true,
    analytics: {
      ...analytics,
      activeClientsLast24h,
      highRiskClients,
      newClientsThisWeek
    }
  });
}

// Get list of all clients for admin
async function getClientsList() {
  const mirrors = getAllAdminMirrors();
  
  const clients = mirrors.map(mirror => {
    const account = getAccountById(mirror.clientId);
    return {
      clientId: mirror.clientId,
      username: account?.username || 'Unknown',
      alias: account?.alias,
      role: mirror.role,
      status: mirror.status,
      sessionCount: mirror.sessionCount,
      currentRiskLevel: mirror.currentRiskLevel,
      lastActivityAt: mirror.lastActivityAt,
      createdAt: mirror.createdAt
    };
  });

  // Sort by last activity (most recent first)
  clients.sort((a, b) => 
    new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
  );

  return NextResponse.json({
    success: true,
    clients,
    total: clients.length
  });
}

// Get detailed client profile
async function getClientDetailedProfile(clientId: string) {
  const profile = getClientProfile(clientId);
  
  if (!profile) {
    return NextResponse.json(
      { success: false, message: 'Client not found' },
      { status: 404 }
    );
  }

  // Get chat summaries
  const chatSummaries = profile.chatHistory.map(chat => ({
    chatId: chat.chatId,
    sessionId: chat.sessionId,
    module: chat.module,
    startedAt: chat.startedAt,
    endedAt: chat.endedAt,
    messageCount: chat.messages.length,
    summary: chat.summary
  }));

  return NextResponse.json({
    success: true,
    profile: {
      account: {
        accountId: profile.account.accountId,
        username: profile.account.username,
        alias: profile.account.alias,
        phone: profile.account.phone,
        email: profile.account.email,
        role: profile.account.role,
        status: profile.account.status,
        createdAt: profile.account.createdAt,
        lastLoginAt: profile.account.lastLoginAt,
        totalSessions: profile.account.totalSessions,
        metadata: profile.account.metadata
      },
      stats: profile.stats,
      riskTimeline: profile.riskTimeline,
      emotionalTrend: profile.emotionalTrend,
      sessions: profile.sessions.map(s => ({
        sessionId: s.sessionId,
        date: s.date,
        module: s.module,
        round: s.round,
        isFirstSession: s.isFirstSession,
        riskScore: s.riskScore,
        emotionalState: s.emotionalState,
        completedAt: s.completedAt,
        durationMinutes: s.durationMinutes,
        responseCount: s.responses.length,
        linkedCaseId: s.linkedCaseId
      })),
      chatHistory: chatSummaries
    }
  });
}

// Get client risk timeline for graphing
async function getClientRiskTimeline(clientId: string) {
  const profile = getClientProfile(clientId);
  
  if (!profile) {
    return NextResponse.json(
      { success: false, message: 'Client not found' },
      { status: 404 }
    );
  }

  // Format for charting libraries
  const riskData = profile.riskTimeline.map(point => ({
    date: point.date,
    value: point.riskScore,
    emotionalState: point.emotionalState,
    module: point.module
  }));

  const emotionalData = profile.emotionalTrend.map(point => ({
    date: point.date,
    value: point.score,
    state: point.state
  }));

  return NextResponse.json({
    success: true,
    riskTimeline: riskData,
    emotionalTrend: emotionalData,
    trendDirection: profile.stats.trendDirection
  });
}
