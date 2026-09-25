import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret_fallback_key";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret_fallback_key";

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

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
