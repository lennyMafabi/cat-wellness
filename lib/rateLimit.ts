// Rate limiting utility for API routes
// In production, replace with Redis-based rate limiting

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  Array.from(rateLimitStore.entries()).forEach(([key, entry]) => {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  });
}, 60000); // Clean up every minute

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Check and update rate limit for an identifier
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowSeconds - Time window in seconds
 * @returns RateLimitResult indicating if request is allowed
 */
export function rateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const key = identifier;
  
  const existing = rateLimitStore.get(key);
  
  if (!existing || now > existing.resetTime) {
    // New window or expired
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs
    };
    rateLimitStore.set(key, newEntry);
    
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetTime: newEntry.resetTime
    };
  }
  
  // Within existing window
  if (existing.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetTime: existing.resetTime
    };
  }
  
  existing.count += 1;
  rateLimitStore.set(key, existing);
  
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - existing.count,
    resetTime: existing.resetTime
  };
}

/**
 * Simple rate limit check (returns boolean)
 * @param identifier - Unique identifier
 * @param maxRequests - Maximum requests allowed
 * @param windowSeconds - Time window in seconds
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): boolean {
  return rateLimit(identifier, maxRequests, windowSeconds).success;
}

/**
 * Get rate limit status without incrementing
 */
export function getRateLimitStatus(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);
  
  if (!existing || now > existing.resetTime) {
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests,
      resetTime: now + (windowSeconds * 1000)
    };
  }
  
  const remaining = Math.max(0, maxRequests - existing.count);
  
  return {
    success: remaining > 0,
    limit: maxRequests,
    remaining,
    resetTime: existing.resetTime
  };
}
