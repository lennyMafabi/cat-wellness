import { z } from 'zod';

// Constants for validation
const MAX_INPUT_LENGTH = 500;
const MAX_NAME_LENGTH = 100;
const MAX_PHONE_LENGTH = 20;
const MAX_MESSAGE_LENGTH = 2000;
const VALID_ANSWER_VALUES = [0, 1, 2, 3, 4] as const;
const VALID_TRACKS = ['child', 'youth', 'adult'] as const;
const VALID_ROLES = ['admin', 'staff'] as const;
const VALID_USER_TYPES = ['victim', 'practitioner'] as const;
const VALID_CLUSTERS = [
  'reexperiencing',
  'avoidance', 
  'hyperarousal',
  'affect dysregulation',
  'negative self concept',
  'disturbed relationships'
] as const;
const VALID_RISK_LEVELS = ['low', 'medium', 'high'] as const;
const VALID_CLUSTER_LEVELS = ['low', 'moderate', 'high'] as const;
const VALID_SENDERS = ['user', 'staff'] as const;
const VALID_CHAT_ACTIONS = ['createSession', 'sendMessage', 'markRead', 'closeSession'] as const;
const VALID_LANGUAGES = ['en', 'sw'] as const;

// Sanitization helper
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Assessment answer validation
export const AnswerValueSchema = z.number().int().min(0).max(4);

export const AnswerMapSchema = z.record(
  z.string().min(1).max(100),
  AnswerValueSchema
).refine(
  (data) => Object.keys(data).length <= 50,
  'Too many answers provided'
);

// User info validation
export const UserInfoSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(MAX_NAME_LENGTH, 'Name too long')
    .transform(sanitizeString),
  phone: z.string()
    .min(1, 'Phone is required')
    .max(MAX_PHONE_LENGTH, 'Phone number too long')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
    .transform(sanitizeString),
  altContact: z.string()
    .max(MAX_PHONE_LENGTH, 'Alternate contact too long')
    .regex(/^[\d\s\-\+\(\)]*$/, 'Invalid contact format')
    .optional()
    .transform((val) => val ? sanitizeString(val) : val),
  relationship: z.string()
    .max(MAX_NAME_LENGTH, 'Relationship text too long')
    .optional()
    .transform((val) => val ? sanitizeString(val) : val),
});

// Assessment submission validation
export const AssessmentSubmissionSchema = z.object({
  userInfo: UserInfoSchema,
  answers: AnswerMapSchema,
  result: z.object({
    riskLevel: z.enum(VALID_RISK_LEVELS),
    summary: z.string().max(MAX_INPUT_LENGTH * 4).transform(sanitizeString),
    clusterLevels: z.record(z.string(), z.string()),
    rawScores: z.record(z.string(), z.number().int().min(0)),
    topCluster: z.enum(VALID_CLUSTERS).nullable(),
    recommendations: z.array(z.string().max(MAX_INPUT_LENGTH).transform(sanitizeString)).max(20),
  }),
  track: z.enum(VALID_TRACKS),
  userType: z.enum(VALID_USER_TYPES).optional(),
});

// Auth validation
export const AuthSchema = z.object({
  username: z.string()
    .min(3, 'Username too short')
    .max(50, 'Username too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .transform(sanitizeString),
  password: z.string()
    .min(5, 'Password must be at least 5 characters')
    .max(128, 'Password too long'),
});

// User creation validation (admin only)
export const UserCreateSchema = z.object({
  username: z.string()
    .min(3, 'Username too short')
    .max(50, 'Username too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .transform(sanitizeString),
  password: z.string()
    .min(5, 'Password must be at least 5 characters')
    .max(128, 'Password too long'),
  role: z.enum(VALID_ROLES).default('staff'),
});

// Chat validation
export const ChatMessageSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(MAX_MESSAGE_LENGTH, 'Message too long')
    .transform(sanitizeString),
  sender: z.enum(VALID_SENDERS),
  staffName: z.string()
    .max(MAX_NAME_LENGTH)
    .optional()
    .transform((val) => val ? sanitizeString(val) : val),
});

export const ChatSessionSchema = z.object({
  userName: z.string()
    .min(1)
    .max(MAX_NAME_LENGTH)
    .transform(sanitizeString),
  userPhone: z.string()
    .max(MAX_PHONE_LENGTH)
    .optional()
    .transform((val) => val ? sanitizeString(val) : val),
  assessmentId: z.string().optional(),
});

// Chat action validation
export const ChatActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('createSession'),
    userName: z.string().min(1).max(MAX_NAME_LENGTH).transform(sanitizeString),
    userPhone: z.string().max(MAX_PHONE_LENGTH).optional().transform((val) => val ? sanitizeString(val) : val),
    assessmentId: z.string().optional(),
  }),
  z.object({
    action: z.literal('sendMessage'),
    sessionId: z.string().uuid(),
    message: z.string().min(1).max(MAX_MESSAGE_LENGTH).transform(sanitizeString),
    sender: z.enum(VALID_SENDERS),
    staffName: z.string().max(MAX_NAME_LENGTH).optional().transform((val) => val ? sanitizeString(val) : val),
  }),
  z.object({
    action: z.literal('markRead'),
    sessionId: z.string().uuid(),
  }),
  z.object({
    action: z.literal('closeSession'),
    sessionId: z.string().uuid(),
  }),
]);

// Search parameters validation
export const SearchParamsSchema = z.object({
  q: z.string().max(200).optional().transform((val) => val ? sanitizeString(val) : val),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// ID parameter validation
export const IdParamSchema = z.string().uuid();

// Language validation
export const LanguageSchema = z.enum(VALID_LANGUAGES);

// Track validation
export const TrackSchema = z.enum(VALID_TRACKS);

// User type validation
export const UserTypeSchema = z.enum(VALID_USER_TYPES);

// Helper to safely validate
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.issues.map((issue: z.ZodIssue) => issue.message);
  return { success: false, errors };
}

// Helper for partial validation (for PATCH updates) - simplified
export function safeValidatePartial(
  schema: z.ZodObject<z.ZodRawShape>, 
  data: unknown
): { success: true; data: Record<string, unknown> } | { success: false; errors: string[] } {
  const partialSchema = schema.partial();
  const result = partialSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data as Record<string, unknown> };
  }
  
  const errors = result.error.issues.map((issue: z.ZodIssue) => issue.message);
  return { success: false, errors };
}
