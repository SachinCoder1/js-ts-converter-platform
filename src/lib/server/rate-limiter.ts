import 'server-only';
import { RATE_LIMITS, FAILURE_LIMITS, GLOBAL_RATE_LIMIT } from '../constants';
import type { RateLimitInfo } from '../types';
import { logSecurityEvent } from './security-logger';

interface RateLimitWindow {
  count: number;
  resetAt: number;
}

interface RequestRecord {
  lastRequestAt: number;
  fingerprint: string;
}

// Rate limit windows per IP
const minuteWindows = new Map<string, RateLimitWindow>();
const hourWindows = new Map<string, RateLimitWindow>();
const dayWindows = new Map<string, RateLimitWindow>();
const concurrentRequests = new Map<string, number>();
const requestRecords = new Map<string, RequestRecord>();

// Failure tracking
interface FailureRecord {
  count: number;
  windowStart: number;
  blockedUntil: number;
}
const failureRecords = new Map<string, FailureRecord>();

// Global rate limit
let globalMinuteCount = 0;
let globalMinuteReset = Date.now() + 60_000;

// Cleanup interval
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, window] of minuteWindows) {
      if (now > window.resetAt) minuteWindows.delete(key);
    }
    for (const [key, window] of hourWindows) {
      if (now > window.resetAt) hourWindows.delete(key);
    }
    for (const [key, window] of dayWindows) {
      if (now > window.resetAt) dayWindows.delete(key);
    }
    for (const [key, record] of requestRecords) {
      if (now - record.lastRequestAt > 60_000) requestRecords.delete(key);
    }
    for (const [key, record] of failureRecords) {
      if (now > record.windowStart + FAILURE_LIMITS.windowMs && now > record.blockedUntil) {
        failureRecords.delete(key);
      }
    }
  }, 5 * 60 * 1000); // Every 5 minutes

  // Unref so it doesn't prevent process exit
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

function getOrCreateWindow(
  map: Map<string, RateLimitWindow>,
  ip: string,
  durationMs: number
): RateLimitWindow {
  const now = Date.now();
  const existing = map.get(ip);
  if (existing && now < existing.resetAt) {
    return existing;
  }
  const window: RateLimitWindow = { count: 0, resetAt: now + durationMs };
  map.set(ip, window);
  return window;
}

export function createFingerprint(ip: string, userAgent: string, acceptLanguage: string): string {
  const raw = `${ip}|${userAgent}|${acceptLanguage}`;
  // Simple hash for fingerprinting
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function isBotLike(
  ip: string,
  userAgent: string,
  fingerprint: string
): boolean {
  // Missing or suspicious user agent
  if (!userAgent || userAgent.length < 10) {
    logSecurityEvent('bot_detected', ip, { userAgent, fingerprint });
    return true;
  }

  // Check for rapid requests (< 1s apart)
  const record = requestRecords.get(fingerprint);
  if (record && Date.now() - record.lastRequestAt < 1000) {
    logSecurityEvent('bot_detected', ip, { userAgent, fingerprint });
    return true;
  }

  return false;
}

export function checkRateLimit(ip: string): { allowed: boolean; info: RateLimitInfo } {
  ensureCleanup();

  const now = Date.now();

  // Check minute window
  const minuteWindow = getOrCreateWindow(minuteWindows, ip, 60_000);
  if (minuteWindow.count >= RATE_LIMITS.perMinute) {
    return {
      allowed: false,
      info: {
        remaining: 0,
        limit: RATE_LIMITS.perMinute,
        reset: Math.ceil((minuteWindow.resetAt - now) / 1000),
      },
    };
  }

  // Check hour window
  const hourWindow = getOrCreateWindow(hourWindows, ip, 3_600_000);
  if (hourWindow.count >= RATE_LIMITS.perHour) {
    return {
      allowed: false,
      info: {
        remaining: 0,
        limit: RATE_LIMITS.perHour,
        reset: Math.ceil((hourWindow.resetAt - now) / 1000),
      },
    };
  }

  // Check day window
  const dayWindow = getOrCreateWindow(dayWindows, ip, 86_400_000);
  if (dayWindow.count >= RATE_LIMITS.perDay) {
    return {
      allowed: false,
      info: {
        remaining: 0,
        limit: RATE_LIMITS.perDay,
        reset: Math.ceil((dayWindow.resetAt - now) / 1000),
      },
    };
  }

  // Increment all windows
  minuteWindow.count++;
  hourWindow.count++;
  dayWindow.count++;

  return {
    allowed: true,
    info: {
      remaining: RATE_LIMITS.perMinute - minuteWindow.count,
      limit: RATE_LIMITS.perMinute,
      reset: Math.ceil((minuteWindow.resetAt - now) / 1000),
    },
  };
}

export function checkConcurrent(ip: string): boolean {
  const current = concurrentRequests.get(ip) || 0;
  if (current >= RATE_LIMITS.concurrent) return false;
  concurrentRequests.set(ip, current + 1);
  return true;
}

export function releaseConcurrent(ip: string): void {
  const current = concurrentRequests.get(ip) || 0;
  if (current <= 1) {
    concurrentRequests.delete(ip);
  } else {
    concurrentRequests.set(ip, current - 1);
  }
}

export function recordRequest(fingerprint: string): void {
  requestRecords.set(fingerprint, {
    lastRequestAt: Date.now(),
    fingerprint,
  });
}

export function recordFailure(ip: string): void {
  const now = Date.now();
  const record = failureRecords.get(ip);

  if (!record || now > record.windowStart + FAILURE_LIMITS.windowMs) {
    failureRecords.set(ip, { count: 1, windowStart: now, blockedUntil: 0 });
    return;
  }

  record.count++;
  if (record.count >= FAILURE_LIMITS.maxFailures) {
    record.blockedUntil = now + FAILURE_LIMITS.blockDurationMs;
  }
}

export function isFailureBlocked(ip: string): boolean {
  const record = failureRecords.get(ip);
  if (!record) return false;
  const now = Date.now();
  if (now < record.blockedUntil) {
    logSecurityEvent('failure_block', ip);
    return true;
  }
  if (record.blockedUntil > 0 && now >= record.blockedUntil) {
    failureRecords.delete(ip);
  }
  return false;
}

export function checkGlobalRateLimit(): boolean {
  const now = Date.now();
  if (now > globalMinuteReset) {
    globalMinuteCount = 0;
    globalMinuteReset = now + 60_000;
  }
  globalMinuteCount++;
  if (globalMinuteCount > GLOBAL_RATE_LIMIT.maxRequestsPerMinute) {
    logSecurityEvent('global_limit_hit', 'system', { count: globalMinuteCount });
    return false;
  }
  return true;
}
