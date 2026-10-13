import { PERMISSIONS } from "../config/permissions.js";

const VALID_PERMISSIONS = Object.values(PERMISSIONS);

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
