import crypto from "crypto";
import User from "../modals/user.schema.js";
import Customer from "../modals/customer.schema.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token.utils.js";
import { sendPasswordResetEmail } from "../utils/email.utils.js";

// Helper:Calculate 7 days expiry for refresh token storage
const getRefreshExpiry = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

export async function registerUser({ name, email, password, role = "customer", department = null }) {
  const normalizedEmail = email?.trim().toLowerCase();

  //Check exisitng user
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new Error("User with this email already exists");
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

  //Create new user
  const user = await User.create({
    name: name?.trim(),
    email: normalizedEmail,
    password,
    role,
    department: role === "employee" ? department?.trim() : null,
    customerId,
  });

  //Issue tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token in user document
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

export async function loginUser({ email, password }) {
  const normalizedEmail = email?.trim().toLowerCase();

  // Find user and explicitly select password and refreshTokens
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password +refreshTokens"
  );

  if (!user || !(await user.comparePassword(password))) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error("Account has been deactivated. Please contact support.");
  }

  //  Issue fresh token pair
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  //  Prune expired refresh tokens and add new one
  const now = new Date();
  user.refreshTokens = user.refreshTokens.filter((t) => t.expiresAt > now);
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: getRefreshExpiry() ,
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
    throw new Error("Refresh token is required");
  }

  // Verify token signature
  let decoded;
  try {
    decoded = verifyRefreshToken(incomingToken);
  } catch {
    throw new Error("Invalid or expired refresh token");
  }

  // Find user with active sessions
  const user = await User.findById(decoded.id).select("+refreshTokens");
  if (!user) {
    throw new Error("User not found");
  }

  // Check if token exists in user's active session list
  const sessionIndex = user.refreshTokens.findIndex(
    (t) => t.token === incomingToken && t.expiresAt > new Date()
  );

  if (sessionIndex === -1) {
    user.refreshTokens = [];
    await user.save();
    throw new Error("Invalid session. Please log in again.");
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

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password/${rawResetToken}`;

  // Attempt real email dispatch if credentials configured in .env
  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
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
    throw new Error("Reset token and new password are required");
  }

  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  // Hash the incoming raw token with SHA-256 to match DB
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    throw new Error("Password reset token is invalid or has expired");
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
