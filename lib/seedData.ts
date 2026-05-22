import { Account, UserRole, Session, EmotionalState, SessionResponse } from '@/types/accountSystem';
import { hashPassword } from './accountSystemDb';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const ACCOUNTS_PATH = join(DATA_DIR, 'accounts.json');
const ACCOUNT_CREDS_PATH = join(DATA_DIR, 'accountCredentials.json');
const SESSIONS_PATH = join(DATA_DIR, 'sessions.json');

// Sample user profiles with realistic session histories
const sampleProfiles = [
  {
    username: 'faith_survivor',
    alias: 'Faith',
    email: 'faith.m@test.org',
    phone: '+254712345001',
    role: 'survivor' as UserRole,
    story: 'Survivor of domestic violence, actively in recovery',
    sessions: [
      { date: '2024-01-15', riskScore: 85, emotionalState: 'Distressed', module: 'TFGBV Initial', round: 'Initial Assessment' },
      { date: '2024-02-01', riskScore: 72, emotionalState: 'Struggling', module: 'Follow-up', round: 'Round 1' },
      { date: '2024-02-15', riskScore: 68, emotionalState: 'Coping', module: 'Follow-up', round: 'Round 2' },
      { date: '2024-03-01', riskScore: 55, emotionalState: 'Managing', module: 'Follow-up', round: 'Round 3' },
      { date: '2024-03-15', riskScore: 48, emotionalState: 'Improving', module: 'Extended Follow-up', round: 'Comprehensive' },
      { date: '2024-04-01', riskScore: 42, emotionalState: 'Stabilizing', module: 'Extended Follow-up', round: 'Comprehensive' },
      { date: '2024-04-15', riskScore: 35, emotionalState: 'Improving', module: 'Extended Follow-up', round: 'Comprehensive' }
    ]
  },
  {
    username: 'amina_2024',
    alias: 'Amina',
    email: 'amina.w@test.org',
    phone: '+254712345002',
    role: 'survivor' as UserRole,
    story: 'Working through trauma with counselor support',
    sessions: [
      { date: '2024-02-10', riskScore: 78, emotionalState: 'Anxious', module: 'TFGBV Initial', round: 'Initial Assessment' },
      { date: '2024-02-24', riskScore: 75, emotionalState: 'Struggling', module: 'Follow-up', round: 'Round 1' },
      { date: '2024-03-10', riskScore: 80, emotionalState: 'Distressed', module: 'Follow-up', round: 'Round 2' },
      { date: '2024-03-24', riskScore: 72, emotionalState: 'Coping', module: 'Follow-up', round: 'Round 3' },
      { date: '2024-04-07', riskScore: 65, emotionalState: 'Managing', module: 'Extended Follow-up', round: 'Comprehensive' },
      { date: '2024-04-21', riskScore: 58, emotionalState: 'Stabilizing', module: 'Extended Follow-up', round: 'Comprehensive' }
    ]
  },
  {
    username: 'grace_healing',
    alias: 'Grace',
    email: 'grace.k@test.org',
    phone: '+254712345003',
    role: 'survivor' as UserRole,
    story: 'Strong progress in healing journey',
    sessions: [
      { date: '2024-01-05', riskScore: 90, emotionalState: 'Crisis', module: 'TFGBV Initial', round: 'Initial Assessment' },
      { date: '2024-01-20', riskScore: 82, emotionalState: 'Distressed', module: 'Follow-up', round: 'Round 1' },
      { date: '2024-02-05', riskScore: 68, emotionalState: 'Struggling', module: 'Follow-up', round: 'Round 2' },
      { date: '2024-02-20', riskScore: 52, emotionalState: 'Coping', module: 'Follow-up', round: 'Round 3' },
      { date: '2024-03-05', riskScore: 38, emotionalState: 'Improving', module: 'Extended Follow-up', round: 'Comprehensive' },
      { date: '2024-03-20', riskScore: 28, emotionalState: 'Stable', module: 'Extended Follow-up', round: 'Comprehensive' },
      { date: '2024-04-05', riskScore: 22, emotionalState: 'Thriving', module: 'Extended Follow-up', round: 'Comprehensive' },
      { date: '2024-04-20', riskScore: 18, emotionalState: 'Thriving', module: 'Extended Follow-up', round: 'Comprehensive' }
    ]
  },
  {
    username: 'practitioner_sarah',
    alias: 'Dr. Sarah',
    email: 'sarah.counselor@catkenya.org',
    phone: '+254712345004',
    role: 'practitioner' as UserRole,
    story: 'Trauma-informed counselor specializing in GBV',
    sessions: [
      { date: '2024-03-01', riskScore: 45, emotionalState: 'Managing', module: 'TFGBV Initial', round: 'Initial Assessment' },
      { date: '2024-03-15', riskScore: 38, emotionalState: 'Stabilizing', module: 'Follow-up', round: 'Round 1' }
    ]
  },
  {
    username: 'counselor_james',
    alias: 'James',
    email: 'james.therapist@catkenya.org',
    phone: '+254712345005',
    role: 'practitioner' as UserRole,
    story: 'Psychotherapist with 10 years experience in trauma',
    sessions: [
      { date: '2024-02-15', riskScore: 42, emotionalState: 'Stabilizing', module: 'TFGBV Initial', round: 'Initial Assessment' },
      { date: '2024-03-01', riskScore: 35, emotionalState: 'Improving', module: 'Follow-up', round: 'Round 1' },
      { date: '2024-03-15', riskScore: 30, emotionalState: 'Stable', module: 'Extended Follow-up', round: 'Comprehensive' }
    ]
  },
  {
    username: 'activist_wanjiku',
    alias: 'Wanjiku',
    email: 'wanjiku.advocate@catkenya.org',
    phone: '+254712345006',
    role: 'online_harms' as UserRole,
    story: 'Online safety advocate and digital rights activist',
    sessions: [
      { date: '2024-01-20', riskScore: 55, emotionalState: 'Managing', module: 'TFGBV Initial', round: 'Initial Assessment' },
      { date: '2024-02-05', riskScore: 48, emotionalState: 'Coping', module: 'Follow-up', round: 'Round 1' },
      { date: '2024-02-20', riskScore: 42, emotionalState: 'Stabilizing', module: 'Follow-up', round: 'Round 2' }
    ]
  },
  {
    username: 'new_client_1',
    alias: 'New Client 1',
    email: 'client1@test.org',
    phone: '+254712345007',
    role: 'survivor' as UserRole,
    story: 'Recently joined, in crisis',
    sessions: [
      { date: '2024-04-15', riskScore: 88, emotionalState: 'Crisis', module: 'TFGBV Initial', round: 'Initial Assessment' }
    ]
  },
  {
    username: 'therapist_mary',
    alias: 'Mary',
    email: 'mary.therapist@catkenya.org',
    phone: '+254712345008',
    role: 'practitioner' as UserRole,
    story: 'Clinical psychologist',
    sessions: []
  }
];

// Generate sample accounts with sessions
export async function generateSampleData(): Promise<{ accounts: Account[]; sessions: Session[] }> {
  const accounts: Account[] = [];
  const credentials: { accountId: string; passwordHash: string; createdAt: string }[] = [];
  const allSessions: Session[] = [];

  const now = new Date();

  for (const profile of sampleProfiles) {
    const accountId = `acc_${profile.username}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();
    const passwordHash = hashPassword(tempPassword);

    // Create account
    const createdAt = profile.sessions.length > 0 
      ? profile.sessions[0].date 
      : new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const account: Account = {
      accountId,
      username: profile.username,
      alias: profile.alias,
      email: profile.email,
      phone: profile.phone,
      role: profile.role,
      status: 'active',
      passwordHash,
      createdAt,
      lastLoginAt: profile.sessions.length > 0 
        ? profile.sessions[profile.sessions.length - 1].date 
        : createdAt,
      totalSessions: profile.sessions.length,
      metadata: {
        firstIntakeComplete: profile.sessions.length > 0,
        story: profile.story,
        lastSessionId: profile.sessions.length > 0 
          ? `sess_${profile.sessions.length}` 
          : undefined
      } as any
    };

    accounts.push(account);

    // Create credentials
    credentials.push({
      accountId,
      passwordHash,
      createdAt: account.createdAt
    });

    // Create sessions
    const accountSessions = profile.sessions.map((sessionData, index) => ({
      sessionId: `sess_${accountId}_${index}`,
      accountId,
      date: sessionData.date,
      module: 'survivor' as const,
      round: index + 1,
      responses: generateSampleResponses(sessionData.riskScore),
      riskScore: sessionData.riskScore / 100,
      emotionalState: 'distressed' as const,
      completedAt: sessionData.date,
      durationMinutes: 15 + Math.floor(Math.random() * 20),
      isFirstSession: index === 0,
      followUpResult: sessionData.module === 'Extended Follow-up' ? {
        ptsdScore: Math.max(0, sessionData.riskScore - 10 + Math.floor(Math.random() * 20)),
        anxietyScore: Math.max(0, sessionData.riskScore - 5 + Math.floor(Math.random() * 15)),
        depressionScore: Math.max(0, sessionData.riskScore - 8 + Math.floor(Math.random() * 18)),
        functioningScore: Math.min(100, 100 - sessionData.riskScore + Math.floor(Math.random() * 20)),
        wellnessScore: Math.min(100, 100 - sessionData.riskScore + Math.floor(Math.random() * 15)),
        overallTrend: (index > 0 && sessionData.riskScore < profile.sessions[index - 1].riskScore ? 'improving' : 
                      index > 0 && sessionData.riskScore > profile.sessions[index - 1].riskScore ? 'worsening' : 'stable') as 'improving' | 'worsening' | 'stable',
        severity: (sessionData.riskScore < 25 ? 'minimal' : 
                  sessionData.riskScore < 50 ? 'mild' : 
                  sessionData.riskScore < 75 ? 'moderate' : 'severe') as 'minimal' | 'mild' | 'moderate' | 'severe',
        recommendations: generateRecommendations(sessionData.riskScore)
      } : undefined
    }));

    allSessions.push(...accountSessions);
  }

  // Write to files
  await writeFile(ACCOUNTS_PATH, JSON.stringify(accounts, null, 2), 'utf-8');
  await writeFile(ACCOUNT_CREDS_PATH, JSON.stringify(credentials, null, 2), 'utf-8');
  await writeFile(SESSIONS_PATH, JSON.stringify(allSessions, null, 2), 'utf-8');

  // Log sample credentials for reference
  console.log('\n=== SAMPLE ACCOUNTS CREATED ===');
  sampleProfiles.forEach((profile, i) => {
    console.log(`Username: ${profile.username}`);
    console.log(`Password: (same as username for demo - use "${profile.username}" as password)`);
    console.log(`Role: ${profile.role}`);
    console.log(`Sessions: ${profile.sessions.length}`);
    console.log('---');
  });
  console.log('================================\n');

  return { accounts, sessions: allSessions };
}

// Generate sample assessment responses
function generateSampleResponses(riskScore: number): SessionResponse[] {
  const baseSeverity = riskScore / 100;
  const timestamp = new Date().toISOString();
  
  return [
    { questionId: 'harassment', questionText: 'Have you experienced harassment?', answer: baseSeverity > 0.6 ? 'yes' : 'no', timestamp, category: 'baseline' },
    { questionId: 'stalking', questionText: 'Have you experienced stalking?', answer: baseSeverity > 0.7 ? 'yes' : 'no', timestamp, category: 'baseline' },
    { questionId: 'emotional_impact', questionText: 'Rate your emotional impact', answer: Math.round(baseSeverity * 4), timestamp, category: 'impact' }
  ];
}

// Generate recommendations based on risk score
function generateRecommendations(riskScore: number): string[] {
  const recs: string[] = [];
  
  if (riskScore > 70) {
    recs.push('Immediate safety planning recommended');
    recs.push('Connect with CAT Kenya crisis support');
    recs.push('Consider trauma-focused therapy (EMDR/CPT)');
  } else if (riskScore > 50) {
    recs.push('Schedule regular counseling sessions');
    recs.push('Practice grounding techniques daily');
    recs.push('Build support network');
  } else if (riskScore > 30) {
    recs.push('Continue current coping strategies');
    recs.push('Engage in self-care activities');
    recs.push('Maintain progress journal');
  } else {
    recs.push('Maintain wellness routine');
    recs.push('Consider peer support mentoring');
    recs.push('Celebrate your progress!');
  }
  
  return recs;
}

// Check if data exists
export async function dataExists(): Promise<boolean> {
  try {
    const fs = await import('fs');
    return fs.existsSync(ACCOUNTS_PATH) && fs.existsSync(SESSIONS_PATH);
  } catch {
    return false;
  }
}
