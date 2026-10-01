import { verifyAccessToken } from "../utils/token.utils.js";
import User from "../modals/user.schema.js";
import { PERMISSIONS } from "../config/permissions.js";

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


// Map base permissions to hardcoded roles
const ROLE_PERMISSIONS = {
  super_admin: ["*"],
  admin: [
    PERMISSIONS.EMPLOYEE_READ, PERMISSIONS.EMPLOYEE_CREATE, PERMISSIONS.EMPLOYEE_UPDATE, PERMISSIONS.EMPLOYEE_DEACTIVATE,
    PERMISSIONS.CUSTOMER_READ, PERMISSIONS.CUSTOMER_CREATE, PERMISSIONS.CUSTOMER_UPDATE, PERMISSIONS.CUSTOMER_DELETE,
    PERMISSIONS.TICKET_READ, PERMISSIONS.TICKET_CREATE, PERMISSIONS.TICKET_ASSIGN, PERMISSIONS.TICKET_UPDATE,
    PERMISSIONS.TICKET_COMMENT, PERMISSIONS.TICKET_INTERNAL_COMMENT,
    PERMISSIONS.DASHBOARD_READ
  ],
  employee: [
    PERMISSIONS.CUSTOMER_READ,
    PERMISSIONS.CUSTOMER_UPDATE,
    PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.TICKET_READ, PERMISSIONS.TICKET_UPDATE, PERMISSIONS.TICKET_COMMENT, PERMISSIONS.TICKET_INTERNAL_COMMENT,
    PERMISSIONS.DASHBOARD_READ
  ],
  customer: [
    PERMISSIONS.CUSTOMER_READ, PERMISSIONS.CUSTOMER_CREATE, PERMISSIONS.CUSTOMER_UPDATE,
    PERMISSIONS.TICKET_READ, PERMISSIONS.TICKET_CREATE, PERMISSIONS.TICKET_COMMENT
  ]
};

// Helper: Calculate total permissions
export function getEffectivePermissions(user) {
  if (!user) return [];
  const basePerms = ROLE_PERMISSIONS[user.role] || [];
  const customPerms = user.customPermissions || [];
  // Return unique combination of both
  return [...new Set([...basePerms, ...customPerms])];
}

// Permission-Based Access Control (PBAC) guard
export function requirePermission(requiredPermission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const effectivePermissions = getEffectivePermissions(req.user);

    // Check for wildcard bypass (Super Admin) or specific permission match
    if (effectivePermissions.includes("*") || effectivePermissions.includes(requiredPermission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Forbidden: Missing required permission [${requiredPermission}]`,
    });
  };
}
