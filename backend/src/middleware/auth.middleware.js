import { verifyAccessToken } from "../utils/token.utils.js";
import User from "../modals/user.schema.js";

// Authenticate user via Bearer accessToken
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid token.",
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or expired. Please refresh your session.",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or account is deactivated.",
      });
    }

    // Attach sanitized user to request object
    req.user = user.toPublicJSON();
    next();
  } catch (error) {
    next(error);
  }
}

// Role-Based Access Control (RBAC) guard
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of the following roles: [${allowedRoles.join(
          ", "
        )}]`,
      });
    }
    next();
  };
}
