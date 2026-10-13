import crypto from "crypto";
import User from "../models/user.schema.js";
import Customer from "../models/customer.schema.js";
import { resolveActiveDepartment } from "./department.service.js";
import { env } from "../config/env.js";
import {generateAccessToken,  generateRefreshToken, verifyRefreshToken} from "../utils/token.utils.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../utils/email.utils.js";
import { AppError } from "../errors/AppError.js";

function authError(message, statusCode, errorCode) {
  return new AppError(message, { statusCode, errorCode });
}

// Helper:Calculate 7 days expiry for refresh token storage
const getRefreshExpiry = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

export async function registerUser({ name, email, password, role = "customer", department = null }) {
  const normalizedEmail = email?.trim().toLowerCase();

  //Check exisitng user
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw authError("User with this email already exists", 409, "USER_ALREADY_EXISTS");
  }

  // Auto-link to existing Customer profile if email matches
  let customerId = null;
  if (role === "customer") {
    const existingCustomer = await Customer.findOne({
      "communications.email": normalizedEmail,
    });
    if (existingCustomer) {
      customerId = existingCustomer._id;
    }
  }

  const departmentRecord = role === "employee"
    ? await resolveActiveDepartment(department)
    : null;

  //Create new user
  const user = await User.create({
    name: name?.trim(),
    email: normalizedEmail,
    password,
    role,
    department: departmentRecord?._id || null,
    customerId,
    isEmailVerified: false,
  });

  if (departmentRecord) {
    await user.populate("department", "departmentName");
  }

  const rawVerificationToken = user.createEmailVerificationToken();
  await user.save();

  const frontendUrl = env.FRONTEND_URL;
  const verifyUrl = `${frontendUrl}/verify-email/${rawVerificationToken}`;

  try {
    if (env.EMAIL_USER && env.EMAIL_PASS) {
      await sendVerificationEmail({
        to: user.email,
        verifyUrl,
        name: user.name,
      });
    } else {
      console.warn(
        "[Nodemailer] EMAIL_USER or EMAIL_PASS not set in backend/.env — verification email skipped."
      );
    }
  } catch (emailError) {
    console.error("[Nodemailer] Delivery failed:", emailError.message);
  }

  return {
    user: user.toPublicJSON(),
    message: "Registration successful. Please check your email to verify your account.",
  };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email?.trim().toLowerCase();

  // Find user and explicitly select password and refreshTokens
  const user = await User.findOne({ email: normalizedEmail })
    .select("+password +refreshTokens")
    .populate("department", "departmentName");

  if (!user || !(await user.comparePassword(password))) {
    throw authError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    throw authError("Account has been deactivated. Please contact support.", 403, "ACCOUNT_DEACTIVATED");
  }

  if (!user.isEmailVerified) {
    throw authError("Please verify your email address to log in.", 403, "EMAIL_VERIFICATION_REQUIRED");
  }

  //  Issue fresh token pair
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  //  Prune expired refresh tokens and add new one
  const now = new Date();
  user.refreshTokens = user.refreshTokens.filter((t) => t.expiresAt > now);
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: getRefreshExpiry(),
  });
  await user.save();

  return {
    user: user.toPublicJSON(),
    accessToken,
    refreshToken,
  };
}

export async function refreshAccessToken(incomingToken) {
  if (!incomingToken) {
    throw authError("Refresh token is required", 400, "REFRESH_TOKEN_REQUIRED");
  }

  // Verify token signature
  let decoded;
  try {
    decoded = verifyRefreshToken(incomingToken);
  } catch {
    throw authError("Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  // Find user with active sessions
  const user = await User.findById(decoded.id)
    .select("+refreshTokens")
    .populate("department", "departmentName");
  if (!user) {
    throw authError("User not found", 401, "INVALID_REFRESH_TOKEN");
  }

  // Check if token exists in user's active session list
  const sessionIndex = user.refreshTokens.findIndex(
    (t) => t.token === incomingToken && t.expiresAt > new Date()
  );

  if (sessionIndex === -1) {
    user.refreshTokens = [];
    await user.save();
    throw authError("Invalid session. Please log in again.", 401, "INVALID_SESSION");
  }

  // Token Rotation: Remove old refresh token and issue new pair
  user.refreshTokens.splice(sessionIndex, 1);

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshTokens.push({
    token: newRefreshToken,
    expiresAt: getRefreshExpiry(),
  });
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logoutUser(userId, tokenToRevoke) {
  if (!userId) return;

  const user = await User.findById(userId).select("+refreshTokens");
  if (!user) return;

  if (tokenToRevoke) {
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== tokenToRevoke);
  } else {
    user.refreshTokens = []; // Logout all sessions
  }

  await user.save();
}

export async function forgotPassword(email) {
  const normalizedEmail = email?.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return {
      message: "If email is registered, a password reset link has been sent.",
    };
  }

  const rawResetToken = user.createPasswordResetToken();
  await user.save();

  const frontendUrl = env.FRONTEND_URL;
  const resetUrl = `${frontendUrl}/reset-password/${rawResetToken}`;

  // Attempt real email dispatch if credentials configured in .env
  try {
    if (env.EMAIL_USER && env.EMAIL_PASS) {
      await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        name: user.name,
      });
    } else {
      console.warn(
        "[Nodemailer] EMAIL_USER or EMAIL_PASS not set in backend/.env — email skipped."
      );
    }
  } catch (emailError) {
    console.error("[Nodemailer] Delivery failed:", emailError.message);
  }

  return {
    message: "Password reset link generated successfully.",
    resetToken: rawResetToken,
    resetUrl,
  };
}

export async function resetPassword(rawToken, newPassword) {
  if (!rawToken || !newPassword) {
    throw authError("Reset token and new password are required", 400, "RESET_CREDENTIALS_REQUIRED");
  }

  if (newPassword.length < 6) {
    throw authError("Password must be at least 6 characters", 400, "PASSWORD_TOO_SHORT");
  }

  // Hash the incoming raw token with SHA-256 to match DB
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    throw authError("Password reset token is invalid or has expired", 400, "INVALID_RESET_TOKEN");
  }

  // Set new password (pre-save hook will hash it)
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = []; // Log out all active sessions on password change
  await user.save();

  return {
    message: "Password reset successful. You can now log in with your new password.",
  };
}

export async function verifyEmail(rawToken) {
  if (!rawToken) {
    throw authError("Verification token is required", 400, "VERIFICATION_TOKEN_REQUIRED");
  }

  // Hash the incoming raw token with SHA-256 to match DB
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    throw authError("Email verification token is invalid or has expired", 400, "INVALID_VERIFICATION_TOKEN");
  }

  // Mark as verified
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return {
    message: "Email verified successfully. You can now log in.",
  };
}
