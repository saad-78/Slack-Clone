const redis = require('redis');

let redisClient = null;

const connectRedis = async () => {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.log('ℹ️ REDIS_URL not set, skipping Redis connection');
    return;
  }

  redisClient = redis.createClient({ url });

  redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err.message);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis Connected');
  });

  try {
    await redisClient.connect();
  } catch (err) {
    console.error('❌ Failed to connect to Redis:', err.message);
    // If it fails, null it out so the rest of the app knows Redis is unavailable
    redisClient = null;
  }
};

const isRedisEnabled = () => !!redisClient && redisClient.isOpen;

module.exports = { redisClient, connectRedis, isRedisEnabled };
