import express from "express";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "../controller/user.controller.js";
import { authenticate, requirePermission } from "../middleware/auth.middleware.js";
import { PERMISSIONS } from "../config/permissions.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createEmployeeSchema,
  employeeIdParamsSchema,
  updateEmployeeSchema,
} from "../validators/user.validator.js";

const router = express.Router();

router.use(authenticate);

// Admins and Employees can view the staff directory
router.get("/employees", requirePermission(PERMISSIONS.EMPLOYEE_READ), getEmployees);

// Only specific PBAC overrides (or Admins) can manage staff
router.post(
  "/employees",
  requirePermission(PERMISSIONS.EMPLOYEE_CREATE),
  validate({ body: createEmployeeSchema }),
  createEmployee
);
router.put(
  "/employees/:id",
  requirePermission(PERMISSIONS.EMPLOYEE_UPDATE),
  validate({ params: employeeIdParamsSchema, body: updateEmployeeSchema }),
  updateEmployee
);
router.delete(
  "/employees/:id",
  requirePermission(PERMISSIONS.EMPLOYEE_DEACTIVATE),
  validate({ params: employeeIdParamsSchema }),
  deleteEmployee
);

export default router;
