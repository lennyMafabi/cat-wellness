import { z } from 'zod';
import { sanitizeString } from '../validation';

// Helper to safely validate
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.issues.map((issue: z.ZodIssue) => issue.message);
  return { success: false, errors };
}

// Valid TFGBV types
const VALID_TFGBV_TYPES = [
  "sextortion", 
  "cyberstalking", 
  "non-consensual_sharing",
  "deepfake",
  "harassment",
  "misinformation",
  "identity_theft",
  "other"
] as const;

// Valid assessment risk levels
const VALID_ASSESSMENT_RISKS = ["low", "moderate", "high", "critical"] as const;

// Valid risk levels
const VALID_RISK_LEVELS = ["low", "medium", "high", "critical"] as const;

// Valid case statuses
const VALID_CASE_STATUSES = ["open", "in_progress", "closed", "escalated"] as const;

// Valid evidence types
const VALID_EVIDENCE_TYPES = ["image", "screenshot", "text", "audio", "video", "link"] as const;

// Client creation validation
export const OnlineHarmsClientSchema = z.object({
  fullName: z.string()
    .max(100, 'Name too long')
    .optional()
    .transform(val => val ? sanitizeString(val) : val),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format')
    .max(20, 'Phone number too long')
    .optional()
    .transform(val => val ? sanitizeString(val) : val),
  email: z.string()
    .email('Invalid email format')
    .max(100, 'Email too long')
    .optional(),
  consentGiven: z.boolean().refine(val => val === true, {
    message: 'Consent is required to proceed with full support'
  })
});

// Limited mode report (no consent)
export const LimitedModeReportSchema = z.object({
  tfgbvType: z.enum(VALID_TFGBV_TYPES),
  description: z.string()
    .min(10, 'Please provide more details')
    .max(5000, 'Description too long')
    .transform(sanitizeString),
  platforms: z.array(z.string().max(50).transform(sanitizeString)).max(10).optional()
});

// Assessment result schema
const AssessmentResultSchema = z.object({
  clusterLevels: z.record(z.string(), z.enum(VALID_ASSESSMENT_RISKS)),
  rawScores: z.record(z.string(), z.number()),
  overallRisk: z.enum(VALID_ASSESSMENT_RISKS),
  topCluster: z.string(),
  summary: z.string(),
  summarySw: z.string(),
  summaryKal: z.string(),
  recommendations: z.array(z.string()),
  recommendationsSw: z.array(z.string()),
  recommendationsKal: z.array(z.string())
});

// Full report with consent
export const OnlineHarmsReportSchema = z.object({
  clientId: z.string().uuid().optional(), // Optional - creates new if not provided
  fullName: z.string()
    .max(100)
    .optional()
    .transform(val => val ? sanitizeString(val) : val),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format')
    .max(20)
    .optional()
    .transform(val => val ? sanitizeString(val) : val),
  email: z.string()
    .email('Invalid email')
    .max(100)
    .optional(),
  consentGiven: z.literal(true).refine(val => val === true, {
    message: 'You must consent to data storage to submit a report'
  }),
  tfgbvType: z.enum(VALID_TFGBV_TYPES),
  description: z.string()
    .min(10, 'Please provide more details about the incident')
    .max(5000, 'Description too long')
    .transform(sanitizeString),
  platforms: z.array(z.string().max(50).transform(sanitizeString)).max(10).optional(),
  evidence: z.array(z.object({
    type: z.enum(VALID_EVIDENCE_TYPES),
    content: z.string().min(1, 'Evidence content required'),
    filename: z.string().max(255).optional(),
    mimeType: z.string().max(100).optional(),
    tags: z.array(z.string().max(50)).max(10).optional()
  })).max(5, 'Maximum 5 evidence items allowed').optional(),
  // TFGBV Assessment data
  assessmentAnswers: z.record(z.string(), z.number()).optional(),
  assessmentResult: AssessmentResultSchema.optional()
});

// Case status update
export const UpdateCaseStatusSchema = z.object({
  caseId: z.string().uuid(),
  status: z.enum(VALID_CASE_STATUSES),
  assignedTo: z.string().max(50).optional()
});

// Admin note
export const AdminNoteSchema = z.object({
  caseId: z.string().uuid(),
  note: z.string()
    .min(1, 'Note cannot be empty')
    .max(2000, 'Note too long')
    .transform(sanitizeString)
});

// Evidence upload
export const EvidenceUploadSchema = z.object({
  caseId: z.string().uuid(),
  clientId: z.string().uuid(),
  type: z.enum(VALID_EVIDENCE_TYPES),
  content: z.string().min(1, 'Evidence content required'),
  filename: z.string().max(255).optional(),
  mimeType: z.string().max(100).optional(),
  size: z.number().int().min(0).max(10 * 1024 * 1024).optional(), // Max 10MB
  tags: z.array(z.string().max(50)).max(10),
  description: z.string().max(500).optional().transform(val => val ? sanitizeString(val) : val)
});

// Risk assessment
export const RiskAssessmentSchema = z.object({
  caseId: z.string().uuid(),
  riskLevel: z.enum(VALID_RISK_LEVELS)
});

// Wellness referral
export const WellnessReferralSchema = z.object({
  caseId: z.string().uuid(),
  assessmentId: z.string().uuid()
});

// Types derived from schemas
export type OnlineHarmsClientInput = z.infer<typeof OnlineHarmsClientSchema>;
export type OnlineHarmsReportInput = z.infer<typeof OnlineHarmsReportSchema>;
export type LimitedModeReportInput = z.infer<typeof LimitedModeReportSchema>;
export type UpdateCaseStatusInput = z.infer<typeof UpdateCaseStatusSchema>;
export type AdminNoteInput = z.infer<typeof AdminNoteSchema>;
export type EvidenceUploadInput = z.infer<typeof EvidenceUploadSchema>;
export type RiskAssessmentInput = z.infer<typeof RiskAssessmentSchema>;
export type WellnessReferralInput = z.infer<typeof WellnessReferralSchema>;
