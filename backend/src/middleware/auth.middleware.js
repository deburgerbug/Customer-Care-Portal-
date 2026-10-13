import { verifyAccessToken } from "../utils/token.utils.js";
import User from "../models/user.schema.js";
import { PERMISSIONS } from "../config/permissions.js";
import { AppError } from "../errors/AppError.js";
import { sanitizeCustomPermissions } from "../utils/permissions.utils.js";

// Authenticate user via Bearer accessToken
export async function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError(
        "Authentication required. Please provide a valid token.",
        { statusCode: 401, errorCode: "AUTHENTICATION_REQUIRED" }
      ));
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      return next(new AppError(
        "Token is invalid or expired. Please refresh your session.",
        { statusCode: 401, errorCode: "INVALID_ACCESS_TOKEN" }
      ));
    }

    const user = await User.findById(decoded.id).populate("department", "departmentName");
    if (!user || !user.isActive) {
      return next(new AppError(
        "User not found or account is deactivated.",
        { statusCode: 401, errorCode: "ACCOUNT_UNAVAILABLE" }
      ));
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

export function getEffectivePermissions(user) {
  if (!user) return [];

  const basePerms = ROLE_PERMISSIONS[user.role] || [];
  const customPerms = sanitizeCustomPermissions(user.customPermissions || []);

  return [...new Set([...basePerms, ...customPerms])];
}

export function requirePermission(requiredPermission) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", {
        statusCode: 401,
        errorCode: "UNAUTHORIZED",
      }));
    }

    const effectivePermissions = getEffectivePermissions(req.user);

    if (effectivePermissions.includes("*") || effectivePermissions.includes(requiredPermission)) {
      return next();
    }

    return next(new AppError(
      `Forbidden: Missing required permission [${requiredPermission}]`,
      { statusCode: 403, errorCode: "FORBIDDEN" }
    ));
  };
}
