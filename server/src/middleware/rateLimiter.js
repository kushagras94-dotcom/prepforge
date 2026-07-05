const redis = require('../config/redisClient');

const BUCKET_CAPACITY = 10;      // max tokens a user can hold
const REFILL_RATE = 1;           // tokens added per second
const REFILL_INTERVAL_MS = 1000; // how often refill logic runs (1 sec)

const rateLimiter = async (req, res, next) => {
  try {
    const userId = req.userId; // set by auth middleware, runs before this
    const key = `ratelimit:${userId}`;

    const now = Date.now();
    const bucketData = await redis.get(key);

    let tokens, lastRefill;

    if (!bucketData) {
      // First request ever for this user — start with a full bucket
      tokens = BUCKET_CAPACITY;
      lastRefill = now;
    } else {
      const parsed = JSON.parse(bucketData);
      tokens = parsed.tokens;
      lastRefill = parsed.lastRefill;

      // Calculate how many tokens to add based on elapsed time
      const elapsedMs = now - lastRefill;
      const tokensToAdd = Math.floor(elapsedMs / REFILL_INTERVAL_MS) * REFILL_RATE;

      if (tokensToAdd > 0) {
        tokens = Math.min(BUCKET_CAPACITY, tokens + tokensToAdd);
        lastRefill = now;
      }
    }

    if (tokens < 1) {
      return res.status(429).json({ message: 'Too many requests. Please slow down.' });
    }

    // Consume one token for this request
    tokens -= 1;

    await redis.set(key, JSON.stringify({ tokens, lastRefill }), 'EX', 60); // expires after 60s of inactivity

    next();
  } catch (err) {
    console.error('Rate limiter error:', err.message);
    next(); // fail open — don't block real users if Redis has an issue
  }
};

module.exports = rateLimiter;
