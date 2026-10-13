import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid ID");

export const departmentIdParamsSchema = z.object({
  id: objectIdSchema,
}).strict();

export const departmentNameSchema = z.object({
  departmentName: z.string().trim().min(1, "Department name is required").max(80),
}).strict();

export const departmentListQuerySchema = z.object({
  includeInactive: z.enum(["true", "false"]).optional()
    .transform((value) => value === "true"),
}).strict();
