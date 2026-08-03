const Redis = require("ioredis");

let redis = null;
let isRedisConnected = false;

const baseOptions = {
  maxRetriesPerRequest: 2,
  enableReadyCheck: true,
  retryStrategy(times) {
    if (times > 5) return null;
    return Math.min(times * 200, 2000);
  },
};

function createRedisClient() {
  const url = process.env.REDIS_URL;

  if (url) {
    const client = new Redis(url, {
      ...baseOptions,
      tls: url.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
    });
    return client;
  }

  return new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    ...baseOptions,
  });
}

function attachListeners(client) {
  client.on("connect", () => {
    isRedisConnected = true;
    console.log("✅ Redis connected");
  });

  client.on("ready", () => {
    isRedisConnected = true;
  });

  client.on("error", (err) => {
    isRedisConnected = false;
    if (process.env.NODE_ENV !== "production") {
      console.warn("⚠️ Redis error:", err.message);
    }
  });

  client.on("end", () => {
    isRedisConnected = false;
  });
}

try {
  redis = createRedisClient();
  attachListeners(redis);
} catch (err) {
  console.warn("⚠️ Redis init failed:", err.message);
  redis = null;
}

module.exports = {
  redis,
  isRedisConnected: () => isRedisConnected && !!redis,
  createSubscriber() {
    if (!redis) return null;
    const subscriber = redis.duplicate();
    attachListeners(subscriber);
    return subscriber;
  },
};
