import { createClient } from "redis";

let redisClient: any = null;
let isRedisAvailable = false;

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

redisClient = createClient({
  url: redisUrl,
  socket: {
    connectTimeout: 3000,
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        isRedisAvailable = false;
        return new Error("Redis connection retry limit reached.");
      }
      return 1000;
    }
  }
});

redisClient.on("error", (err: any) => {
  console.warn("Redis Client Warning:", err.message);
  isRedisAvailable = false;
});

redisClient.on("connect", () => {
  isRedisAvailable = true;
  console.log("Redis Client Connected successfully.");
});

// Try to connect asynchronously
redisClient.connect().catch((err: any) => {
  console.warn("Redis connection failed on startup. Running in memory mode.");
  isRedisAvailable = false;
});

export async function getCache(key: string): Promise<string | null> {
  if (!isRedisAvailable || !redisClient) return null;
  try {
    return await redisClient.get(key);
  } catch (err) {
    return null;
  }
}

export async function setCache(key: string, value: string, ttlSeconds = 3600): Promise<void> {
  if (!isRedisAvailable || !redisClient) return;
  try {
    await redisClient.set(key, value, {
      EX: ttlSeconds,
    });
  } catch (err) {
    // Fail silently on cache write issues
  }
}

export { redisClient, isRedisAvailable };
