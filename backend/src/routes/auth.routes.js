import { Router } from "express";
import * as authController from "../controller/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { requireAllowedOrigin } from "../middleware/requireAllowedOrigin.middleware.js";
import { authenticationLimiter, loginLimiter, passwordRecoveryLimiter, registrationLimiter,} from "../config/rateLimiter.js";
import {forgotPasswordSchema,loginSchema, registerSchema, resetPasswordSchema, tokenParamsSchema,} from "../validators/auth.validator.js";

const router = Router();

// Public Authentication Endpoints
router.post("/register", registrationLimiter, validate({ body: registerSchema }), authController.register);
router.post("/login", requireAllowedOrigin, loginLimiter, validate({ body: loginSchema }), authController.login);
router.post("/refresh", requireAllowedOrigin, authenticationLimiter, authController.refresh);
router.post("/logout", requireAllowedOrigin, authenticationLimiter, authenticate, authController.logout);

// Password Recovery & Email Verification
router.post("/forgot-password", passwordRecoveryLimiter, validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post(
  "/reset-password/:token",
  passwordRecoveryLimiter,
  validate({ params: tokenParamsSchema, body: resetPasswordSchema }),
  authController.resetPassword
);
router.post(
  "/verify-email/:token",
  authenticationLimiter,
  validate({ params: tokenParamsSchema }),
  authController.verifyEmail
);

// Protected Identity Endpoint
router.get("/me", authenticate, authController.getMe);

export default router;
