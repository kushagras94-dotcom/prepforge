const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Check Redis connection when the server starts
(async () => {
  try {
    const result = await redis.ping();
    console.log('Redis connected:', result);
  } catch (err) {
    console.error('Redis connection error:', err.message);
  }
})();

module.exports = redis;