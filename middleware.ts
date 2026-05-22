import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RateLimiterRes, RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiters
const apiLimiter = new RateLimiterMemory({
  keyPrefix: 'api',
  points: 20, // 20 requests
  duration: 60, // per minute
});

const authLimiter = new RateLimiterMemory({
  keyPrefix: 'auth',
  points: 5, // 5 login attempts
  duration: 300, // per 5 minutes
});

const chatLimiter = new RateLimiterMemory({
  keyPrefix: 'chat',
  points: 30,
  duration: 60,
});

// Bot detection patterns
const SUSPICIOUS_USER_AGENTS = [
  /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i,
  /python/i, /java/i, /perl/i, /ruby/i, /php/i, /go-http/i,
  /postman/i, /insomnia/i, /puppeteer/i, /playwright/i, /selenium/i,
];

const SUSPICIOUS_IPS = new Set<string>();

function isBot(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Check user agent
  if (SUSPICIOUS_USER_AGENTS.some(pattern => pattern.test(userAgent))) {
    return true;
  }
  
  // Check for missing user agent
  if (!userAgent || userAgent.length < 10) {
    return true;
  }
  
  // Check for suspicious headers
  const acceptHeader = request.headers.get('accept');
  if (!acceptHeader && !request.nextUrl.pathname.startsWith('/api/')) {
    return true;
  }
  
  return false;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return '127.0.0.1';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);
  
  // Security headers
  const response = NextResponse.next();
  
  // Content Security Policy
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; " +
    "font-src 'self'; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );
  
  // Other security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  );
  
  // Bot detection
  if (isBot(request)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403, headers: response.headers }
      );
    }
  }
  
  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    let limiter = apiLimiter;
    
    // Stricter limits for auth
    if (pathname.includes('/api/auth')) {
      limiter = authLimiter;
    }
    
    // Chat has its own limit
    if (pathname.includes('/api/chat')) {
      limiter = chatLimiter;
    }
    
    try {
      await limiter.consume(ip);
    } catch (rejRes) {
      if (rejRes instanceof RateLimiterRes) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { 
            status: 429, 
            headers: {
              ...Object.fromEntries(response.headers),
              'Retry-After': String(Math.ceil(rejRes.msBeforeNext / 1000))
            }
          }
        );
      }
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png.jpg).*)',
  ],
};
