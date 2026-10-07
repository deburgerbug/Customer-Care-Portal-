import express from "express";
import {
  createDepartment,
  deactivateDepartment,
  getDepartments,
  reactivateDepartment,
  updateDepartment,
} from "../controller/department.controller.js";
import { authenticate, requirePermission } from "../middleware/auth.middleware.js";
import { PERMISSIONS } from "../config/permissions.js";

const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user?.role === "admin" || req.user?.role === "super_admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Forbidden: Admin access required",
  });
}

router.use(authenticate, requireAdmin);

router.get("/", requirePermission(PERMISSIONS.DEPARTMENT_MANAGE), getDepartments);
router.post("/", requirePermission(PERMISSIONS.DEPARTMENT_MANAGE), createDepartment);
router.put("/:id", requirePermission(PERMISSIONS.DEPARTMENT_MANAGE), updateDepartment);
router.delete("/:id", requirePermission(PERMISSIONS.DEPARTMENT_MANAGE), deactivateDepartment);
router.patch("/:id/reactivate", requirePermission(PERMISSIONS.DEPARTMENT_MANAGE), reactivateDepartment);

export default router;
