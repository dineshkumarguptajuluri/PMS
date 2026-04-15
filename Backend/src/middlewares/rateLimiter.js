const rateLimit = require('express-rate-limit');

/**
 * Login rate limiter: 5 attempts per minute per IP.
 * Prevents brute-force password attacks.
 */
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many login attempts. Please try again after 1 minute.'
  }
});

/**
 * Interest request rate limiter: 5 requests per minute per IP.
 * Prevents clients from spamming interest requests.
 */
const interestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many interest requests. Please try again after 1 minute.'
  }
});

module.exports = { loginLimiter, interestLimiter };
