// Simple in-memory rate limiter
// For production, use Redis-based (upstash/ratelimit)

const requests = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number = 30, windowMs: number = 60000): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = requests.get(key);

  if (!record || now > record.resetAt) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count++;
  return { success: true, remaining: limit - record.count };
}

// Clean up old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of requests.entries()) {
      if (now > val.resetAt) requests.delete(key);
    }
  }, 300000);
}
