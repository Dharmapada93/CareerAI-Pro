import { isRedisAvailable, redisClient } from "./redis";

// Simple in-memory fallback cache for rate-limiting
const memoryStore = new Map<string, { count: number; resetTime: number }>();

export async function rateLimit(
  ip: string,
  limit = 30,
  durationSeconds = 60
): Promise<{ success: boolean; limit: number; remaining: number }> {
  const cleanIp = ip || "anonymous";
  
  if (isRedisAvailable && redisClient) {
    try {
      const key = `ratelimit:${cleanIp}`;
      const requests = await redisClient.incr(key);
      if (requests === 1) {
        await redisClient.expire(key, durationSeconds);
      }
      return {
        success: requests <= limit,
        limit,
        remaining: Math.max(0, limit - requests),
      };
    } catch (err) {
      console.warn("Redis ratelimit failure, using memory fallback.");
    }
  }

  // Local Memory Fallback
  const now = Date.now();
  const key = cleanIp;
  const resetDurationMs = durationSeconds * 1000;

  const current = memoryStore.get(key);
  if (!current || now > current.resetTime) {
    memoryStore.set(key, {
      count: 1,
      resetTime: now + resetDurationMs,
    });
    return {
      success: true,
      limit,
      remaining: limit - 1,
    };
  }

  current.count += 1;
  const isAllowed = current.count <= limit;
  return {
    success: isAllowed,
    limit,
    remaining: Math.max(0, limit - current.count),
  };
}
