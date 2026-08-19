/**
 * Simple In-Memory Rate Limiter
 * 
 * Note: In a serverless environment like Vercel, this state will be lost on cold starts
 * and will not be shared across edge nodes. For production on serverless, a Redis-based
 * solution like @upstash/ratelimit is recommended.
 * 
 * However, this is sufficient to stop basic automated scripting attacks
 * against a single container instance.
 */

type RateLimitRecord = {
  count: number;
  lastReset: number;
};

const limits = new Map<string, RateLimitRecord>();

export function rateLimit(
  ip: string,
  limit: number = 5,
  windowMs: number = 60 * 1000 // default 1 minute
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  let record = limits.get(ip);

  if (!record) {
    record = { count: 0, lastReset: now };
    limits.set(ip, record);
  }

  // Reset if window has passed
  if (now - record.lastReset > windowMs) {
    record.count = 0;
    record.lastReset = now;
  }

  const isAllowed = record.count < limit;
  
  if (isAllowed) {
    record.count += 1;
  }

  return {
    success: isAllowed,
    limit,
    remaining: Math.max(0, limit - record.count),
    reset: record.lastReset + windowMs
  };
}

// Clean up memory periodically to prevent memory leaks in long-running processes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of limits.entries()) {
    if (now - record.lastReset > 15 * 60 * 1000) { // Clean up records older than 15 minutes
      limits.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes
