import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
const ACCESS_SECRET = env.JWT_ACCESS_SECRET
const REFRESH_SECRET = env.JWT_REFRESH_SECRET
const ACCESS_EXPIRES_IN = env.JWT_ACCESS_EXPIRES_IN 
const REFRESH_EXPIRES_IN = env.JWT_REFRESH_EXPIRES_IN 

// Generate short-lived access token (15 mins) for stateless API access
export function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      customerId: user.customerId || null,
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

// Generate long-lived refresh token (7 days) for session maintenance
export function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user._id,
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

// Verify incoming access token from Authorization header
export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

// Verify incoming refresh token
export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}
