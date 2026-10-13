import { Router } from "express";
import * as authController from "../controller/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {forgotPasswordSchema,loginSchema, logoutSchema, refreshSchema, registerSchema, resetPasswordSchema, tokenParamsSchema,} from "../validators/auth.validator.js";

const router = Router();

// Public Authentication Endpoints
router.post("/register", validate({ body: registerSchema }), authController.register);
router.post("/login", validate({ body: loginSchema }), authController.login);
router.post("/refresh", validate({ body: refreshSchema }), authController.refresh);
router.post("/logout", authenticate, validate({ body: logoutSchema }), authController.logout);

// Password Recovery & Email Verification
router.post("/forgot-password", validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post(
  "/reset-password/:token",
  validate({ params: tokenParamsSchema, body: resetPasswordSchema }),
  authController.resetPassword
);
router.post(
  "/verify-email/:token",
  validate({ params: tokenParamsSchema }),
  authController.verifyEmail
);

// Protected Identity Endpoint
router.get("/me", authenticate, authController.getMe);

export default router;
