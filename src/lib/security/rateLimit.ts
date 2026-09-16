/**
 * In-memory sliding window rate limiter for authentication endpoints.
 * Provides protection against brute force and credential stuffing attacks.
 */

interface RateLimitRecord {
  attempts: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

export function checkRateLimit(
  identifier: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; remainingAttempts: number; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, {
      attempts: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remainingAttempts: maxAttempts - 1,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (record.attempts >= maxAttempts) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds: Math.max(retryAfter, 1),
    };
  }

  record.attempts += 1;
  return {
    allowed: true,
    remainingAttempts: maxAttempts - record.attempts,
    retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000),
  };
}

export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}
