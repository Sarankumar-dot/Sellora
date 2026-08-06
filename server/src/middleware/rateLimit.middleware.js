import { rateLimit } from 'express-rate-limit';

const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;

const createAuthLimiter = (limit, message) =>
  rateLimit({
    windowMs: FIFTEEN_MINUTES_IN_MS,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      return res.status(429).json({
        success: false,
        statusCode: 429,
        message,
      });
    },
  });

export const loginLimiter = createAuthLimiter(
  5,
  'Too many login attempts. Please try again after 15 minutes.'
);

export const forgotPasswordLimiter = createAuthLimiter(
  3,
  'Too many password reset requests. Please try again later.'
);

export const resetPasswordLimiter = createAuthLimiter(
  5,
  'Too many reset attempts. Please try again later.'
);
