const Redis = require('ioredis');

let redis;
let isRedisConnected = false;
let errorHandled = false;

const createRedisClient = () => {
  const client = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    retryStrategy: () => null, // Disable retries
    maxRetriesPerRequest: 0,
  });

  client.on('connect', () => {
    isRedisConnected = true;
    errorHandled = false;
  });

  client.on('error', () => {
    isRedisConnected = false;
    if (!errorHandled) {
      errorHandled = true;
    }
    client.disconnect(); // Stop further attempts
  });

  client.on('end', () => {
    isRedisConnected = false;
  });

  return client;
};

try {
  redis = createRedisClient();
} catch (err) {
  errorHandled = true;
}

module.exports = {
  redis,
  isRedisConnected: () => isRedisConnected,
  errorHandled: () => errorHandled
};
