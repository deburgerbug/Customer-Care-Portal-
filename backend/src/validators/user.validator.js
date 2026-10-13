import { z } from "zod";
import { PERMISSIONS } from "../config/permissions.js";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid ID");
const departmentIdentifierSchema = z.string().trim().min(1).max(80);
const nameSchema = z.string().trim().min(2).max(60);
const emailSchema = z.string().trim().toLowerCase().email();
const customPermissionsSchema = z.array(z.enum(Object.values(PERMISSIONS)));

export const employeeIdParamsSchema = z.object({
  id: objectIdSchema,
}).strict();

export const createEmployeeSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: departmentIdentifierSchema,
}).strict();

export const updateEmployeeSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  department: departmentIdentifierSchema.optional(),
  isActive: z.boolean().optional(),
  customPermissions: customPermissionsSchema.optional(),
}).strict();
