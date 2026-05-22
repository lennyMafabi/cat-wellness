// Account System Types - Longitudinal Monitoring & Follow-up System

export type UserRole = 'survivor' | 'practitioner' | 'online_harms';
export type AccountStatus = 'active' | 'inactive' | 'suspended';
export type EmotionalState = 'calm' | 'distressed' | 'high_risk' | 'critical';
export type SessionModule = 'survivor' | 'practitioner' | 'online_harms';

// ==================== ACCOUNT TYPES ====================

export interface Account {
  accountId: string; // UUID
  username: string;
  alias?: string;
  phone?: string;
  email?: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  lastLoginAt: string;
  lastSessionId?: string;
  totalSessions: number;
  metadata?: {
    firstIntakeComplete: boolean;
    preferredLanguage?: string;
    consentGiven: boolean;
    consentTimestamp?: string;
    requirePasswordChange?: boolean;
    passwordResetAt?: string;
  };
  
  // For password reset functionality
  passwordHash?: string;
}

export interface AdminMirrorRecord {
  mirrorId: string;
  clientId: string; // References Account.accountId
  createdAt: string;
  role: UserRole;
  status: AccountStatus;
  lastActivityAt: string;
  sessionCount: number;
  currentRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface AccountCredentials {
  accountId: string;
  passwordHash: string;
  createdAt: string;
  lastPasswordChange?: string;
}

// ==================== SESSION TYPES ====================

export interface Session {
  sessionId: string; // UUID
  accountId: string; // References Account.accountId
  date: string; // ISO timestamp
  module: SessionModule;
  round: number; // 1-5 (follow-up round)
  isFirstSession: boolean;
  
  // Assessment Results
  riskScore: number; // 0.0 - 1.0
  emotionalState: EmotionalState;
  
  // Responses
  responses: SessionResponse[];
  
  // Assessment Data (for modules that use it)
  assessmentData?: {
    answers?: Record<string, number>;
    clusterScores?: Record<string, number>;
    overallRisk?: 'low' | 'moderate' | 'high' | 'critical';
  };
  
  // Extended Follow-up Assessment Results
  followUpResult?: {
    ptsdScore: number;
    anxietyScore: number;
    depressionScore: number;
    functioningScore: number;
    wellnessScore: number;
    overallTrend: 'improving' | 'worsening' | 'stable';
    severity: 'minimal' | 'mild' | 'moderate' | 'severe';
    recommendations: string[];
  };
  
  // Case linking (for Online Harms)
  linkedCaseId?: string;
  
  // Metadata
  durationMinutes?: number;
  completedAt?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SessionResponse {
  questionId: string;
  questionText: string;
  answer: string | number | boolean;
  timestamp: string;
  category?: string; // 'baseline', 'context', 'risk', 'impact', 'stability'
}

// ==================== CHAT RETENTION TYPES ====================

export interface RetainedChat {
  chatId: string;
  accountId: string;
  sessionId: string;
  module: SessionModule;
  messages: RetainedMessage[];
  messageCount: number; // Computed from messages.length
  startedAt: string;
  endedAt?: string;
  summary?: string; // AI-generated summary
}

export interface RetainedMessage {
  messageId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'crisis';
}

// ==================== FOLLOW-UP QUESTION TYPES ====================

export interface FollowUpRound {
  roundNumber: 1 | 2 | 3 | 4 | 5;
  name: string;
  description: string;
  questions: FollowUpQuestion[];
}

export interface FollowUpQuestion {
  questionId: string;
  round: 1 | 2 | 3 | 4 | 5;
  category: 'baseline' | 'context' | 'risk' | 'impact' | 'stability';
  text: Record<string, string>; // Multilingual
  type: 'single_choice' | 'text' | 'scale' | 'yes_no';
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  riskWeight: number; // How much this affects risk score
  required: boolean;
  
  // Role-specific display
  applicableRoles: UserRole[];
}

// ==================== ADMIN DASHBOARD TYPES ====================

export interface ClientProfile {
  account: Account;
  sessions: Session[];
  chatHistory: RetainedChat[];
  riskTimeline: RiskDataPoint[];
  emotionalTrend: EmotionalDataPoint[];
  stats: ClientStats;
}

export interface RiskDataPoint {
  sessionId: string;
  date: string;
  riskScore: number;
  emotionalState: EmotionalState;
  module: SessionModule;
}

export interface EmotionalDataPoint {
  sessionId: string;
  date: string;
  state: EmotionalState;
  score: number;
}

export interface ClientStats {
  totalSessions: number;
  sessionsByModule: Record<SessionModule, number>;
  averageRiskScore: number;
  highestRiskSession?: Session;
  lastActiveDate: string;
  trendDirection: 'improving' | 'stable' | 'worsening' | 'unknown';
}

export interface SystemAnalytics {
  totalAccounts: number;
  activeAccountsToday: number;
  sessionsLast7Days: number;
  sessionsLast30Days: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  moduleUsage: Record<SessionModule, number>;
  emotionalStateDistribution: Record<EmotionalState, number>;
}

// ==================== API REQUEST/RESPONSE TYPES ====================

export interface CreateAccountRequest {
  username: string;
  alias?: string;
  phone?: string;
  email?: string;
  role: UserRole;
  password: string;
  consentGiven: boolean;
  preferredLanguage?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  account?: Account;
  isReturningUser: boolean;
  lastSession?: Session;
  message: string;
}

export interface SessionStartRequest {
  accountId: string;
  module: SessionModule;
  isFirstSession: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface SessionSubmitRequest {
  sessionId: string;
  responses: SessionResponse[];
  assessmentData?: Session['assessmentData'];
  durationMinutes?: number;
}

export interface QuickCheckInRequest {
  accountId: string;
  currentEmotionalState: EmotionalState;
  needsSupport: boolean;
  notes?: string;
}
