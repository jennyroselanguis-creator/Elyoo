const buckets = new Map();

/**
 * Client-side rate limiting to reduce brute-force / enumeration
 */
export function checkRateLimit(action, maxAttempts = 5, windowMs = 60_000) {
  const now = Date.now();
  const entry = buckets.get(action) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count += 1;
  buckets.set(action, entry);

  if (entry.count > maxAttempts) {
    const waitSec = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      message: `Too many attempts. Please wait ${waitSec} seconds.`,
    };
  }

  return { allowed: true };
}

export function resetRateLimit(action) {
  buckets.delete(action);
}
