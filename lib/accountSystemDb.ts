import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import type { 
  Account, 
  AdminMirrorRecord, 
  AccountCredentials,
  Session,
  RetainedChat,
  ClientProfile,
  RiskDataPoint,
  ClientStats,
  SystemAnalytics,
  UserRole,
  EmotionalState,
  SessionModule
} from '@/types/accountSystem';

const DATA_DIR = path.join(process.cwd(), 'data');
const ACCOUNTS_PATH = path.join(DATA_DIR, 'accounts.json');
const ACCOUNT_CREDS_PATH = path.join(DATA_DIR, 'accountCredentials.json');
const ADMIN_MIRROR_PATH = path.join(DATA_DIR, 'adminMirrorRecords.json');
const SESSIONS_PATH = path.join(DATA_DIR, 'sessions.json');
const RETAINED_CHATS_PATH = path.join(DATA_DIR, 'retainedChats.json');

// In-memory cache for production (Vercel serverless)
const memoryCache: Record<string, any> = {
  [ACCOUNTS_PATH]: [],
  [ACCOUNT_CREDS_PATH]: [],
  [ADMIN_MIRROR_PATH]: [],
  [SESSIONS_PATH]: [],
  [RETAINED_CHATS_PATH]: []
};

const isProduction = process.env.NODE_ENV === 'production';

// Auto-backup mechanism: save to data/backup-{timestamp}.json
function createBackup(data: any) {
  if (isProduction) return; // Don't create backups on Vercel
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(DATA_DIR, `backup-${timestamp}.json`);
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
  } catch (err) {
    // Silently fail - backups are optional
  }
}

// Initialize database files
function initAccountDb() {
  if (isProduction) return; // Skip file init in production
  
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  const files = [
    ACCOUNTS_PATH, 
    ACCOUNT_CREDS_PATH, 
    ADMIN_MIRROR_PATH, 
    SESSIONS_PATH, 
    RETAINED_CHATS_PATH
  ];
  
  files.forEach(file => {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify([], null, 2));
    }
  });
}

// Generic read/write helpers with fallback to memory
function readJson<T>(filePath: string): T[] {
  // In production, use memory cache with auto-seeding
  if (isProduction) {
    // Seed admin accounts on first access to accounts or credentials
    if (filePath === ACCOUNTS_PATH || filePath === ACCOUNT_CREDS_PATH) {
      ensureAdminAccountsSeeded();
    }
    return memoryCache[filePath] || [];
  }
  
  // In development, use file system
  initAccountDb();
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function writeJson<T>(filePath: string, data: T[]): void {
  // Always update memory cache
  memoryCache[filePath] = data;
  
  // In production, skip file write (read-only filesystem)
  if (isProduction) {
    return;
  }
  
  // In development, write to file
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to write JSON:', error);
  }
}

// Simple hash function (for demo purposes - use bcrypt in production)
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & 0xffffffff; // Keep as 32-bit signed integer
  }
  return Math.abs(hash).toString(16);
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Ensure admin accounts are seeded in memory
function ensureAdminAccountsSeeded() {
  const accounts = memoryCache[ACCOUNTS_PATH] || [];
  
  // Check if admin accounts exist
  const hasAdminAccount = accounts.some((a: any) => a.username === 'admin');
  const hasPractitionerAccount = accounts.some((a: any) => a.username === 'practitioner');
  const hasLawrenceAccount = accounts.some((a: any) => a.username === 'Lawrence');
  
  // Seed admin accounts if they don't exist
  if (!hasAdminAccount || !hasPractitionerAccount || !hasLawrenceAccount) {
    const seedAccounts: Account[] = [
      {
        accountId: 'admin-practitioner-001',
        username: 'admin',
        alias: 'Dr. Admin',
        email: 'admin@catkenya.org',
        role: 'practitioner',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        totalSessions: 0,
        metadata: {
          firstIntakeComplete: false,
          preferredLanguage: 'en',
          consentGiven: true,
          consentTimestamp: new Date().toISOString()
        }
      },
      {
        accountId: 'admin-practitioner-002',
        username: 'practitioner',
        alias: 'Dr. Counselor',
        email: 'practitioner@catkenya.org',
        role: 'practitioner',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        totalSessions: 0,
        metadata: {
          firstIntakeComplete: false,
          preferredLanguage: 'en',
          consentGiven: true,
          consentTimestamp: new Date().toISOString()
        }
      },
      {
        accountId: 'online-harms-001',
        username: 'Lawrence',
        alias: 'Mafabi',
        email: 'kingjesuschurch@gmail.com',
        role: 'online_harms',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        totalSessions: 0,
        metadata: {
          firstIntakeComplete: false,
          preferredLanguage: 'en',
          consentGiven: true,
          consentTimestamp: new Date().toISOString()
        }
      }
    ];
    
    // Add missing accounts
    const newAccounts = [...(accounts as Account[])];
    if (!hasAdminAccount) {
      newAccounts.push(seedAccounts[0]);
    }
    if (!hasPractitionerAccount) {
      newAccounts.push(seedAccounts[1]);
    }
    if (!hasLawrenceAccount) {
      newAccounts.push(seedAccounts[2]);
    }
    
    memoryCache[ACCOUNTS_PATH] = newAccounts;
    
    // Also seed credentials
    const creds = memoryCache[ACCOUNT_CREDS_PATH] || [];
    const newCreds = [...(creds as AccountCredentials[])];
    
    if (!hasAdminAccount) {
      newCreds.push({
        accountId: 'admin-practitioner-001',
        passwordHash: hashPassword('admin'),
        createdAt: new Date().toISOString()
      });
    }
    
    if (!hasPractitionerAccount) {
      newCreds.push({
        accountId: 'admin-practitioner-002',
        passwordHash: hashPassword('practitioner'),
        createdAt: new Date().toISOString()
      });
    }
    
    if (!hasLawrenceAccount) {
      newCreds.push({
        accountId: 'online-harms-001',
        passwordHash: hashPassword('Lawrence'),
        createdAt: new Date().toISOString()
      });
    }
    
    memoryCache[ACCOUNT_CREDS_PATH] = newCreds;
  }
}

// ==================== ACCOUNT OPERATIONS ====================

export function createAccount(
  username: string,
  password: string,
  role: UserRole,
  consentGiven: boolean,
  alias?: string,
  phone?: string,
  email?: string,
  preferredLanguage?: string
): Account {
  const now = new Date().toISOString();
  const accountId = uuidv4();
  
  const account: Account = {
    accountId,
    username,
    alias,
    phone,
    email,
    role,
    status: 'active',
    createdAt: now,
    lastLoginAt: now,
    totalSessions: 0,
    metadata: {
      firstIntakeComplete: false,
      preferredLanguage: preferredLanguage || 'en',
      consentGiven,
      consentTimestamp: consentGiven ? now : undefined
    }
  };
  
  // Save account
  const accounts = readJson<Account>(ACCOUNTS_PATH);
  
  // Check for duplicate username
  if (accounts.some(a => a.username === username)) {
    throw new Error('Username already exists');
  }
  
  accounts.push(account);
  writeJson(ACCOUNTS_PATH, accounts);
  
  // Save credentials
  const creds: AccountCredentials = {
    accountId,
    passwordHash: hashPassword(password),
    createdAt: now
  };
  
  const allCreds = readJson<AccountCredentials>(ACCOUNT_CREDS_PATH);
  allCreds.push(creds);
  writeJson(ACCOUNT_CREDS_PATH, allCreds);
  
  // Create admin mirror record
  createAdminMirror(accountId, role, now);
  
  return account;
}

export function authenticateAccount(username: string, password: string): Account | null {
  const accounts = readJson<Account>(ACCOUNTS_PATH);
  const account = accounts.find(a => a.username === username);
  
  if (!account) return null;
  
  const allCreds = readJson<AccountCredentials>(ACCOUNT_CREDS_PATH);
  const creds = allCreds.find(c => c.accountId === account.accountId);
  
  if (!creds || !verifyPassword(password, creds.passwordHash)) {
    return null;
  }
  
  // Update last login
  account.lastLoginAt = new Date().toISOString();
  const accountIndex = accounts.findIndex(a => a.accountId === account.accountId);
  accounts[accountIndex] = account;
  writeJson(ACCOUNTS_PATH, accounts);
  
  // Update admin mirror
  updateAdminMirrorLastActivity(account.accountId);
  
  return account;
}

export function getAccountById(accountId: string): Account | undefined {
  const accounts = readJson<Account>(ACCOUNTS_PATH);
  return accounts.find(a => a.accountId === accountId);
}

export function getAllAccounts(): Account[] {
  return readJson<Account>(ACCOUNTS_PATH);
}

export function updateAccount(account: Account): void {
  const accounts = readJson<Account>(ACCOUNTS_PATH);
  const index = accounts.findIndex(a => a.accountId === account.accountId);
  if (index !== -1) {
    accounts[index] = account;
    writeJson(ACCOUNTS_PATH, accounts);
  }
}

export function markFirstIntakeComplete(accountId: string): void {
  const account = getAccountById(accountId);
  if (account && account.metadata) {
    account.metadata.firstIntakeComplete = true;
    updateAccount(account);
  }
}

export function resetPassword(accountId: string): { tempPassword: string; success: boolean } {
  const account = getAccountById(accountId);
  if (!account) {
    return { tempPassword: '', success: false };
  }
  
  // Generate a random temporary password
  const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();
  
  // Hash the temporary password
  const newPasswordHash = hashPassword(tempPassword);
  
  // Update accountCredentials.json with the new password hash
  const allCreds = readJson<AccountCredentials>(ACCOUNT_CREDS_PATH);
  const credIndex = allCreds.findIndex(c => c.accountId === accountId);
  
  if (credIndex !== -1) {
    allCreds[credIndex].passwordHash = newPasswordHash;
    writeJson(ACCOUNT_CREDS_PATH, allCreds);
  } else {
    // If credentials don't exist, create them
    allCreds.push({
      accountId: accountId,
      passwordHash: newPasswordHash,
      createdAt: new Date().toISOString()
    });
    writeJson(ACCOUNT_CREDS_PATH, allCreds);
  }
  
  // Also update the account's passwordHash field for consistency
  account.passwordHash = newPasswordHash;
  
  // Set flag requiring password change on next login
  if (!account.metadata) {
    account.metadata = { firstIntakeComplete: true, consentGiven: true };
  }
  account.metadata!.requirePasswordChange = true;
  account.metadata!.passwordResetAt = new Date().toISOString();
  
  updateAccount(account);
  
  return { tempPassword, success: true };
}

// ==================== ADMIN MIRROR OPERATIONS ====================

function createAdminMirror(
  clientId: string,
  role: UserRole,
  timestamp: string
): AdminMirrorRecord {
  const mirror: AdminMirrorRecord = {
    mirrorId: uuidv4(),
    clientId,
    createdAt: timestamp,
    role,
    status: 'active',
    lastActivityAt: timestamp,
    sessionCount: 0
  };
  
  const mirrors = readJson<AdminMirrorRecord>(ADMIN_MIRROR_PATH);
  mirrors.push(mirror);
  writeJson(ADMIN_MIRROR_PATH, mirrors);
  
  return mirror;
}

function updateAdminMirrorLastActivity(clientId: string): void {
  const mirrors = readJson<AdminMirrorRecord>(ADMIN_MIRROR_PATH);
  const mirror = mirrors.find(m => m.clientId === clientId);
  
  if (mirror) {
    mirror.lastActivityAt = new Date().toISOString();
    const index = mirrors.findIndex(m => m.mirrorId === mirror.mirrorId);
    mirrors[index] = mirror;
    writeJson(ADMIN_MIRROR_PATH, mirrors);
  }
}

export function updateAdminMirrorStats(
  clientId: string,
  sessionCount: number,
  currentRiskLevel?: 'low' | 'medium' | 'high' | 'critical'
): void {
  const mirrors = readJson<AdminMirrorRecord>(ADMIN_MIRROR_PATH);
  const mirror = mirrors.find(m => m.clientId === clientId);
  
  if (mirror) {
    mirror.sessionCount = sessionCount;
    mirror.lastActivityAt = new Date().toISOString();
    if (currentRiskLevel) {
      mirror.currentRiskLevel = currentRiskLevel;
    }
    const index = mirrors.findIndex(m => m.mirrorId === mirror.mirrorId);
    mirrors[index] = mirror;
    writeJson(ADMIN_MIRROR_PATH, mirrors);
  }
}

export function getAllAdminMirrors(): AdminMirrorRecord[] {
  return readJson<AdminMirrorRecord>(ADMIN_MIRROR_PATH);
}

export function getAdminMirrorByClientId(clientId: string): AdminMirrorRecord | undefined {
  const mirrors = readJson<AdminMirrorRecord>(ADMIN_MIRROR_PATH);
  return mirrors.find(m => m.clientId === clientId);
}

// ==================== SESSION OPERATIONS ====================

export function createSession(
  accountId: string,
  module: SessionModule,
  isFirstSession: boolean,
  round: number,
  ipAddress?: string,
  userAgent?: string
): Session {
  const now = new Date().toISOString();
  const sessionId = uuidv4();
  
  const session: Session = {
    sessionId,
    accountId,
    date: now,
    module,
    round,
    isFirstSession,
    riskScore: 0,
    emotionalState: 'calm',
    responses: [],
    ipAddress,
    userAgent
  };
  
  const sessions = readJson<Session>(SESSIONS_PATH);
  sessions.push(session);
  writeJson(SESSIONS_PATH, sessions);
  
  // Update account
  const account = getAccountById(accountId);
  if (account) {
    account.totalSessions = getSessionsByAccount(accountId).length + 1;
    account.lastSessionId = sessionId;
    updateAccount(account);
    
    // Update admin mirror
    updateAdminMirrorStats(accountId, account.totalSessions);
  }
  
  return session;
}

export function getSessionById(sessionId: string): Session | undefined {
  const sessions = readJson<Session>(SESSIONS_PATH);
  return sessions.find(s => s.sessionId === sessionId);
}

export function getSessionsByAccount(accountId: string): Session[] {
  const sessions = readJson<Session>(SESSIONS_PATH);
  return sessions
    .filter(s => s.accountId === accountId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getLastSessionByAccount(accountId: string): Session | undefined {
  const sessions = getSessionsByAccount(accountId);
  return sessions[0];
}

export function updateSession(session: Session): void {
  const sessions = readJson<Session>(SESSIONS_PATH);
  const index = sessions.findIndex(s => s.sessionId === session.sessionId);
  if (index !== -1) {
    sessions[index] = session;
    writeJson(SESSIONS_PATH, sessions);
    
    // Update admin mirror with latest risk level
    const riskMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'calm': 'low',
      'distressed': 'medium',
      'high_risk': 'high',
      'critical': 'critical'
    };
    updateAdminMirrorStats(
      session.accountId, 
      getSessionsByAccount(session.accountId).length,
      riskMap[session.emotionalState] || 'low'
    );
  }
}

export function completeSession(
  sessionId: string,
  responses: Session['responses'],
  riskScore: number,
  emotionalState: EmotionalState,
  assessmentData?: Session['assessmentData'],
  durationMinutes?: number,
  followUpResult?: Session['followUpResult']
): Session | undefined {
  const session = getSessionById(sessionId);
  if (!session) return undefined;
  
  session.responses = responses;
  session.riskScore = riskScore;
  session.emotionalState = emotionalState;
  session.assessmentData = assessmentData;
  session.durationMinutes = durationMinutes;
  session.completedAt = new Date().toISOString();
  session.followUpResult = followUpResult;
  
  updateSession(session);
  
  return session;
}

export function linkSessionToCase(sessionId: string, caseId: string): void {
  const session = getSessionById(sessionId);
  if (session) {
    session.linkedCaseId = caseId;
    updateSession(session);
  }
}

// ==================== CHAT RETENTION OPERATIONS ====================

export function createRetainedChat(
  accountId: string,
  sessionId: string,
  module: SessionModule
): RetainedChat {
  const chat: RetainedChat = {
    chatId: uuidv4(),
    accountId,
    sessionId,
    module,
    messages: [],
    messageCount: 0,
    startedAt: new Date().toISOString()
  };
  
  const chats = readJson<RetainedChat>(RETAINED_CHATS_PATH);
  chats.push(chat);
  writeJson(RETAINED_CHATS_PATH, chats);
  
  return chat;
}

export function addMessageToRetainedChat(
  chatId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  sentiment?: 'positive' | 'neutral' | 'negative' | 'crisis'
): void {
  const chats = readJson<RetainedChat>(RETAINED_CHATS_PATH);
  const chat = chats.find(c => c.chatId === chatId);
  
  if (chat) {
    chat.messages.push({
      messageId: uuidv4(),
      role,
      content,
      timestamp: new Date().toISOString(),
      sentiment
    });
    chat.messageCount = chat.messages.length;
    
    const index = chats.findIndex(c => c.chatId === chatId);
    chats[index] = chat;
    writeJson(RETAINED_CHATS_PATH, chats);
  }
}

export function endRetainedChat(chatId: string, summary?: string): void {
  const chats = readJson<RetainedChat>(RETAINED_CHATS_PATH);
  const chat = chats.find(c => c.chatId === chatId);
  
  if (chat) {
    chat.endedAt = new Date().toISOString();
    if (summary) chat.summary = summary;
    
    const index = chats.findIndex(c => c.chatId === chatId);
    chats[index] = chat;
    writeJson(RETAINED_CHATS_PATH, chats);
  }
}

export function getChatsByAccount(accountId: string): RetainedChat[] {
  const chats = readJson<RetainedChat>(RETAINED_CHATS_PATH);
  return chats
    .filter(c => c.accountId === accountId)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export function getChatsBySession(sessionId: string): RetainedChat[] {
  const chats = readJson<RetainedChat>(RETAINED_CHATS_PATH);
  return chats.filter(c => c.sessionId === sessionId);
}

// ==================== CLIENT PROFILE & ANALYTICS ====================

export function getClientProfile(accountId: string): ClientProfile | null {
  const account = getAccountById(accountId);
  if (!account) return null;
  
  const sessions = getSessionsByAccount(accountId);
  const chatHistory = getChatsByAccount(accountId);
  
  // Build risk timeline
  const riskTimeline: RiskDataPoint[] = sessions.map(s => ({
    sessionId: s.sessionId,
    date: s.date,
    riskScore: s.riskScore,
    emotionalState: s.emotionalState,
    module: s.module
  }));
  
  // Build emotional trend
  const emotionalScores: Record<EmotionalState, number> = {
    'calm': 1,
    'distressed': 3,
    'high_risk': 4,
    'critical': 5
  };
  
  const emotionalTrend = sessions.map(s => ({
    sessionId: s.sessionId,
    date: s.date,
    state: s.emotionalState,
    score: emotionalScores[s.emotionalState]
  }));
  
  // Calculate stats
  const sessionsByModule: Record<SessionModule, number> = {
    survivor: 0,
    practitioner: 0,
    online_harms: 0
  };
  
  sessions.forEach(s => {
    sessionsByModule[s.module]++;
  });
  
  const averageRiskScore = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + s.riskScore, 0) / sessions.length
    : 0;
  
  const sortedByRisk = [...sessions].sort((a, b) => b.riskScore - a.riskScore);
  
  // Determine trend
  let trendDirection: ClientStats['trendDirection'] = 'unknown';
  if (sessions.length >= 3) {
    const recent = sessions.slice(0, 3);
    const older = sessions.slice(3, 6);
    
    if (older.length > 0) {
      const recentAvg = recent.reduce((sum, s) => sum + s.riskScore, 0) / recent.length;
      const olderAvg = older.reduce((sum, s) => sum + s.riskScore, 0) / older.length;
      
      if (recentAvg < olderAvg - 0.1) trendDirection = 'improving';
      else if (recentAvg > olderAvg + 0.1) trendDirection = 'worsening';
      else trendDirection = 'stable';
    }
  }
  
  const stats: ClientStats = {
    totalSessions: sessions.length,
    sessionsByModule,
    averageRiskScore: Math.round(averageRiskScore * 100) / 100,
    highestRiskSession: sortedByRisk[0],
    lastActiveDate: account.lastLoginAt,
    trendDirection
  };
  
  return {
    account,
    sessions,
    chatHistory,
    riskTimeline,
    emotionalTrend,
    stats
  };
}

export function getSystemAnalytics(): SystemAnalytics {
  const accounts = readJson<Account>(ACCOUNTS_PATH);
  const sessions = readJson<Session>(SESSIONS_PATH);
  
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const activeToday = accounts.filter(a => {
    const lastLogin = new Date(a.lastLoginAt);
    return lastLogin.toDateString() === now.toDateString();
  }).length;
  
  const sessionsLast7Days = sessions.filter(s => 
    new Date(s.date) >= sevenDaysAgo
  ).length;
  
  const sessionsLast30Days = sessions.filter(s => 
    new Date(s.date) >= thirtyDaysAgo
  ).length;
  
  // Risk distribution
  const riskDistribution = {
    low: sessions.filter(s => s.emotionalState === 'calm').length,
    medium: sessions.filter(s => s.emotionalState === 'distressed').length,
    high: sessions.filter(s => s.emotionalState === 'high_risk').length,
    critical: sessions.filter(s => s.emotionalState === 'critical').length
  };
  
  // Module usage
  const moduleUsage: Record<SessionModule, number> = {
    survivor: sessions.filter(s => s.module === 'survivor').length,
    practitioner: sessions.filter(s => s.module === 'practitioner').length,
    online_harms: sessions.filter(s => s.module === 'online_harms').length
  };
  
  // Emotional state distribution
  const emotionalStateDistribution: Record<EmotionalState, number> = {
    calm: sessions.filter(s => s.emotionalState === 'calm').length,
    distressed: sessions.filter(s => s.emotionalState === 'distressed').length,
    high_risk: sessions.filter(s => s.emotionalState === 'high_risk').length,
    critical: sessions.filter(s => s.emotionalState === 'critical').length
  };
  
  return {
    totalAccounts: accounts.length,
    activeAccountsToday: activeToday,
    sessionsLast7Days,
    sessionsLast30Days,
    riskDistribution,
    moduleUsage,
    emotionalStateDistribution
  };
}

// ==================== UTILITY FUNCTIONS ====================

export function determineNextRound(accountId: string, module: SessionModule): number {
  const sessions = getSessionsByAccount(accountId)
    .filter(s => s.module === module);
  
  if (sessions.length === 0) return 1;
  
  // Find the highest completed round
  const completedRounds = sessions
    .filter(s => s.completedAt)
    .map(s => s.round);
  
  if (completedRounds.length === 0) return 1;
  
  const maxRound = Math.max(...completedRounds);
  
  // Cycle through rounds 1-5
  return ((maxRound) % 5) + 1;
}

export function shouldShowQuickReassessment(accountId: string): boolean {
  const lastSession = getLastSessionByAccount(accountId);
  if (!lastSession) return false;
  
  const lastSessionDate = new Date(lastSession.date);
  const now = new Date();
  const hoursSinceLastSession = (now.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60);
  
  // Show quick reassessment if it's been more than 24 hours
  return hoursSinceLastSession > 24;
}

export function calculateRiskScoreFromResponses(responses: Session['responses']): number {
  if (responses.length === 0) return 0;
  
  // Simple calculation - can be enhanced with more sophisticated algorithm
  const riskResponses = responses.filter(r => 
    typeof r.answer === 'string' && 
    ['yes', 'high', 'severe', 'critical', 'distressed'].includes(r.answer.toLowerCase())
  );
  
  return Math.min(riskResponses.length / responses.length, 1);
}

export function determineEmotionalStateFromRisk(riskScore: number): EmotionalState {
  if (riskScore >= 0.75) return 'critical';
  if (riskScore >= 0.5) return 'high_risk';
  if (riskScore >= 0.25) return 'distressed';
  return 'calm';
}
