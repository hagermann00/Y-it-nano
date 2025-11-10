/**
 * FIX #2: RATE LIMITING CONFIGURATION
 *
 * Redis-based rate limiting to prevent abuse and control costs
 *
 * Setup Instructions:
 * 1. Install Redis:
 *    - Local dev: brew install redis (Mac) or apt-get install redis (Linux)
 *    - Production: AWS ElastiCache or Redis Cloud
 *
 * 2. Install dependencies:
 *    npm install redis express-rate-limit rate-limit-redis
 *
 * 3. Add to environment variables:
 *    REDIS_URL=redis://localhost:6379 (local)
 *    REDIS_URL=redis://user:password@host:port (production)
 *
 * 4. Start Redis:
 *    redis-server (local)
 */

import { createClient } from 'redis';
import { rateLimit } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Initialize Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('❌ Redis connection failed after 10 retries');
        return new Error('Redis connection failed');
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

// Connect to Redis
redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

// Connect immediately
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
  }
})();

/**
 * EMAIL-BASED RATE LIMITER
 *
 * Limit: 1 request per email per 24 hours
 * Purpose: Prevent same user from spamming evaluator with same email
 * Cost impact: Each roast costs ~$0.003 in OpenAI API fees
 */
export const emailRateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate_limit:email:',
    sendCommand: async (...args) => redisClient.sendCommand(args),
  }),

  // 24 hours in milliseconds
  windowMs: 24 * 60 * 60 * 1000,

  // Maximum 1 request per email per 24 hours
  max: 1,

  // Extract email from request body
  keyGenerator: (req) => {
    const email = req.body?.customer_email || req.body?.email;
    if (!email) {
      // If no email provided, fall back to IP (will be caught by IP limiter)
      return req.ip || 'unknown';
    }
    return email.toLowerCase().trim();
  },

  // Standardized error response
  handler: (req, res) => {
    const email = req.body?.customer_email || req.body?.email;
    const retryAfter = res.getHeader('Retry-After');

    console.log(`⚠️  Rate limit exceeded for email: ${email}`);

    res.status(429).json({
      error: 'rate_limit_exceeded',
      message: 'You can only submit one roast per email address per 24 hours',
      retry_after_seconds: retryAfter,
      retry_after_human: `${Math.ceil(retryAfter / 3600)} hours`,
      suggestions: [
        'Use a different email address',
        'Wait 24 hours before submitting again',
        'Purchase the full book for unlimited access'
      ]
    });
  },

  // Don't send standard rate limit headers (custom response instead)
  standardHeaders: true,
  legacyHeaders: false,

  // Skip rate limiting for successful requests only
  skipSuccessfulRequests: false,

  // Skip rate limiting for failed requests (allow retries on errors)
  skipFailedRequests: true,
});

/**
 * IP-BASED RATE LIMITER
 *
 * Limit: 10 requests per IP per hour
 * Purpose: Prevent automated bots from spamming evaluator
 * Allows multiple users behind same IP (office, cafe) some flexibility
 */
export const ipRateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate_limit:ip:',
    sendCommand: async (...args) => redisClient.sendCommand(args),
  }),

  // 1 hour in milliseconds
  windowMs: 60 * 60 * 1000,

  // Maximum 10 requests per IP per hour
  max: 10,

  // Extract IP from request
  keyGenerator: (req) => {
    // Support for proxies (Cloudflare, nginx, etc.)
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      // Take first IP if multiple proxies
      return forwardedFor.split(',')[0].trim();
    }
    const realIp = req.headers['x-real-ip'];
    if (realIp) {
      return realIp.trim();
    }
    return req.ip || 'unknown';
  },

  // Standardized error response
  handler: (req, res) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    const retryAfter = res.getHeader('Retry-After');

    console.log(`⚠️  Rate limit exceeded for IP: ${ip}`);

    res.status(429).json({
      error: 'rate_limit_exceeded',
      message: 'Too many roast requests from this IP address. Please try again later.',
      retry_after_seconds: retryAfter,
      retry_after_human: `${Math.ceil(retryAfter / 60)} minutes`,
      suggestions: [
        'Wait an hour before submitting again',
        'Try from a different network',
        'Contact support if you believe this is an error'
      ]
    });
  },

  standardHeaders: true,
  legacyHeaders: false,

  skipSuccessfulRequests: false,
  skipFailedRequests: true,
});

/**
 * STRICT RATE LIMITER (for paid endpoints)
 *
 * Limit: 5 requests per IP per minute
 * Purpose: Prevent brute force attacks on authentication endpoints
 */
export const strictRateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate_limit:strict:',
    sendCommand: async (...args) => redisClient.sendCommand(args),
  }),

  windowMs: 60 * 1000, // 1 minute
  max: 5,

  keyGenerator: (req) => {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }
    return req.ip || 'unknown';
  },

  handler: (req, res) => {
    res.status(429).json({
      error: 'rate_limit_exceeded',
      message: 'Too many requests. Please wait a minute and try again.',
    });
  },

  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Helper function to check rate limit status without incrementing
 */
export async function checkRateLimitStatus(key, prefix = 'rate_limit:email:') {
  try {
    const fullKey = `${prefix}${key}`;
    const value = await redisClient.get(fullKey);
    const ttl = await redisClient.ttl(fullKey);

    return {
      requests: value ? parseInt(value) : 0,
      remaining: value ? Math.max(0, 1 - parseInt(value)) : 1,
      resetAt: ttl > 0 ? new Date(Date.now() + ttl * 1000) : null,
    };
  } catch (error) {
    console.error('Error checking rate limit status:', error);
    return null;
  }
}

/**
 * Helper function to manually reset rate limit for a key
 * (for admin/support use only)
 */
export async function resetRateLimit(key, prefix = 'rate_limit:email:') {
  try {
    const fullKey = `${prefix}${key}`;
    await redisClient.del(fullKey);
    console.log(`✅ Rate limit reset for: ${key}`);
    return true;
  } catch (error) {
    console.error('Error resetting rate limit:', error);
    return false;
  }
}

/**
 * Graceful shutdown handler
 */
export async function closeRedisConnection() {
  try {
    await redisClient.quit();
    console.log('✅ Redis connection closed gracefully');
  } catch (error) {
    console.error('❌ Error closing Redis connection:', error);
  }
}

// Export Redis client for use in other modules
export { redisClient };
