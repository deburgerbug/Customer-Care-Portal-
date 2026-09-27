import { Router } from "express";
import * as authController from "../controller/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Public Authentication Endpoints
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authenticate, authController.logout);

// Password Recovery & Email Verification
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.post("/verify-email/:token", authController.verifyEmail);

// Protected Identity Endpoint
router.get("/me", authenticate, authController.getMe);

export default router;
