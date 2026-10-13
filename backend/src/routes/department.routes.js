import express from "express";
import {createDepartment, deactivateDepartment, getDepartments, reactivateDepartment, updateDepartment} from "../controller/department.controller.js";
import { authenticate, requirePermission } from "../middleware/auth.middleware.js";
import { PERMISSIONS } from "../config/permissions.js";
import { AppError } from "../errors/AppError.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  departmentIdParamsSchema,
  departmentListQuerySchema,
  departmentNameSchema,
} from "../validators/department.validator.js";

const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user?.role === "admin" || req.user?.role === "super_admin") {
    return next();
  }

  return next(new AppError("Forbidden: Admin access required", {
    statusCode: 403,
    errorCode: "FORBIDDEN",
  }));
}

router.use(authenticate, requireAdmin);

router.get(
  "/",
  requirePermission(PERMISSIONS.DEPARTMENT_MANAGE),
  validate({ query: departmentListQuerySchema }),
  getDepartments
);
router.post(
  "/",
  requirePermission(PERMISSIONS.DEPARTMENT_MANAGE),
  validate({ body: departmentNameSchema }),
  createDepartment
);
router.put(
  "/:id",
  requirePermission(PERMISSIONS.DEPARTMENT_MANAGE),
  validate({ params: departmentIdParamsSchema, body: departmentNameSchema }),
  updateDepartment
);
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.DEPARTMENT_MANAGE),
  validate({ params: departmentIdParamsSchema }),
  deactivateDepartment
);
router.patch(
  "/:id/reactivate",
  requirePermission(PERMISSIONS.DEPARTMENT_MANAGE),
  validate({ params: departmentIdParamsSchema }),
  reactivateDepartment
);

export default router;
