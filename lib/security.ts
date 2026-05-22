import crypto from 'crypto';

// Environment variables (with defaults for development)
const MAX_PASSWORD_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// In-memory rate limiting for auth (in production, use Redis)
const loginAttempts = new Map<string, { count: number; lockedUntil: number | null }>();

// Account lockout check
export function isAccountLocked(identifier: string): boolean {
  const attempts = loginAttempts.get(identifier);
  
  if (!attempts) return false;
  
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    return true;
  }
  
  // Reset if lockout expired
  if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
    loginAttempts.delete(identifier);
    return false;
  }
  
  return false;
}

// Record failed login attempt
export function recordFailedLogin(identifier: string): void {
  const attempts = loginAttempts.get(identifier) || { count: 0, lockedUntil: null };
  attempts.count += 1;
  
  if (attempts.count >= MAX_PASSWORD_ATTEMPTS) {
    attempts.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
  }
  
  loginAttempts.set(identifier, attempts);
}

// Reset login attempts on successful login
export function resetLoginAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Hash sensitive data for logging (anonymization)
export function hashForLogging(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

// Sanitize error messages for client
export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Don't expose internal details
    if (error.message.includes('password') || 
        error.message.includes('auth') ||
        error.message.includes('token') ||
        error.message.includes('credential')) {
      return 'Authentication failed';
    }
    return 'An error occurred';
  }
  return 'An error occurred';
}

// Validate environment
export function validateEnvironment(): void {
  const required = ['NODE_ENV'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }
}

// Content sanitization for display
export function sanitizeForDisplay(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Check if string contains potential SQL injection patterns
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(\b(UNION|OR|AND)\b.*=)/i,
    /(--|#|\/\*|\*\/)/,
    /(\b(WHERE|FROM|TABLE)\b.*=)/i,
    /(\bxor\b|\blike\b)/i,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

// Validate file path (prevent directory traversal)
export function isValidFilePath(path: string): boolean {
  // Check for directory traversal attempts
  if (path.includes('..') || path.includes('~') || path.startsWith('/')) {
    return false;
  }
  
  // Only allow alphanumeric, hyphens, underscores, and single dots for extensions
  const validPattern = /^[a-zA-Z0-9_\-\.\/]+$/;
  return validPattern.test(path);
}
