// Minimal stub so app runs without Redis

const connectRedis = async () => {
  console.log('ℹ️ Redis disabled (no REDIS_URL), skipping connection');
};

const redisClient = null;

const isRedisEnabled = () => false;

module.exports = { redisClient, connectRedis, isRedisEnabled };
