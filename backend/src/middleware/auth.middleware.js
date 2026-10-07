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

    const user = await User.findById(decoded.id).populate("department", "departmentName");
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
    PERMISSIONS.DEPARTMENT_MANAGE,
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

export const VALID_PERMISSIONS = Object.values(PERMISSIONS);

export function sanitizeCustomPermissions(customPermissions = []) {
  if (!Array.isArray(customPermissions)) {
    return [];
  }

  return [...new Set(
    customPermissions
      .filter((permission) => typeof permission === "string")
      .map((permission) => permission.trim())
      .filter((permission) => permission && permission !== "*" && VALID_PERMISSIONS.includes(permission))
  )];
}

export function getEffectivePermissions(user) {
  if (!user) return [];

  const basePerms = ROLE_PERMISSIONS[user.role] || [];
  const customPerms = sanitizeCustomPermissions(user.customPermissions || []);

  return [...new Set([...basePerms, ...customPerms])];
}

export function requirePermission(requiredPermission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const effectivePermissions = getEffectivePermissions(req.user);

    if (effectivePermissions.includes("*") || effectivePermissions.includes(requiredPermission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Forbidden: Missing required permission [${requiredPermission}]`,
    });
  };
}
