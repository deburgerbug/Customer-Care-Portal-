import { rateLimit } from "express-rate-limit";

function createRateLimiter(limit, message) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      errorCode: "RATE_LIMITED",
      message,
    },
  });
}

export const authenticationLimiter = createRateLimiter(
  60,
  "Too many authentication requests. Please try again later."
);

export const loginLimiter = createRateLimiter(
  10,
  "Too many login attempts. Please try again in 15 minutes."
);

export const registrationLimiter = createRateLimiter(
  10,
  "Too many registration attempts. Please try again in 15 minutes."
);

export const passwordRecoveryLimiter = createRateLimiter(
  5,
  "Too many password recovery attempts. Please try again in 15 minutes."
);
