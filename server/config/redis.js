const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL, // leave undefined if you don't want Redis
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis Connected');
});

const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    console.log('ℹ️ REDIS_URL not set, skipping Redis connection');
    return;
  }

  try {
    await redisClient.connect();
  } catch (err) {
    console.error('❌ Failed to connect to Redis:', err.message);
  }
};

module.exports = { redisClient, connectRedis };
