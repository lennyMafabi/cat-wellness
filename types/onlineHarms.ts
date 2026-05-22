// Online Harms Module Types

export type TfgbvType = 
  | "sextortion" 
  | "cyberstalking" 
  | "non-consensual_sharing"
  | "deepfake"
  | "harassment"
  | "misinformation"
  | "identity_theft"
  | "other";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type CaseStatus = "open" | "in_progress" | "closed" | "escalated";

export type EvidenceType = "image" | "screenshot" | "text" | "audio" | "video" | "link";

// Client/Reporter - Privacy-first identification
export interface OnlineHarmsClient {
  clientId: string;
  fullName?: string;
  phone?: string;
  email?: string;
  consentGiven: boolean;
  consentTimestamp?: string;
  createdAt: string;
  lastActivityAt: string;
  notes?: string;
}

// Assessment Result
export interface TfgbvAssessmentResult {
  clusterLevels: Record<string, 'low' | 'moderate' | 'high' | 'critical'>;
  rawScores: Record<string, number>;
  overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  topCluster: string;
  summary: string;
  summarySw: string;
  summaryKal: string;
  recommendations: string[];
  recommendationsSw: string[];
  recommendationsKal: string[];
}

// Case/Report
export interface OnlineHarmsCase {
  caseId: string;
  clientId: string;
  riskLevel: RiskLevel;
  tfgbvType: TfgbvType;
  description: string;
  platforms?: string[]; // e.g., ["Facebook", "WhatsApp", "Instagram"]
  status: CaseStatus;
  consentGiven: boolean; // Copy at time of report
  createdAt: string;
  updatedAt: string;
  assignedTo?: string; // Admin username
  // TFGBV Assessment data
  assessmentAnswers?: Record<string, number>;
  assessmentResult?: TfgbvAssessmentResult;
  wellnessReferral?: {
    referred: boolean;
    assessmentId?: string;
    referredAt?: string;
  };
}

// Evidence
export interface OnlineHarmsEvidence {
  evidenceId: string;
  caseId: string;
  clientId: string;
  type: EvidenceType;
  content: string; // Base64 for images, text content, or file reference
  filename?: string;
  mimeType?: string;
  size?: number;
  tags: string[];
  description?: string;
  uploadedAt: string;
}

// Admin Notes
export interface CaseAdminNote {
  noteId: string;
  caseId: string;
  adminUsername: string;
  note: string;
  createdAt: string;
}

// Audit Trail
export interface AuditLog {
  logId: string;
  action: "case_created" | "evidence_added" | "case_viewed" | "case_updated" | "data_deleted" | "wellness_referral";
  caseId?: string;
  clientId?: string;
  adminUsername?: string;
  details: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
}

// Consent Record
export interface ConsentRecord {
  consentId: string;
  clientId: string;
  type: "data_storage" | "admin_access" | "wellness_referral";
  given: boolean;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

// Report Form Data (for submission)
export interface OnlineHarmsReportForm {
  fullName?: string;
  phone?: string;
  email?: string;
  consentGiven: boolean;
  tfgbvType: TfgbvType;
  description: string;
  platforms?: string[];
  evidence?: {
    type: EvidenceType;
    content: string;
    filename?: string;
    mimeType?: string;
    tags?: string[];
  }[];
}

// Client Summary for Admin Dashboard
export interface ClientSummary {
  clientId: string;
  fullName?: string;
  contact?: string;
  caseCount: number;
  latestActivity: string;
  hasOpenCases: boolean;
  consentGiven: boolean;
}

// Case Detail for Admin View
export interface CaseDetail extends OnlineHarmsCase {
  clientFullName?: string;
  clientPhone?: string;
  clientEmail?: string;
  evidence: OnlineHarmsEvidence[];
  adminNotes: CaseAdminNote[];
  auditLogs: AuditLog[];
}
