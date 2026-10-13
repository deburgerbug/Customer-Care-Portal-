import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid ID");
const ticketStatusSchema = z.enum(["open", "in-progress", "resolved", "closed"]);
const ticketPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export const ticketIdParamsSchema = z.object({
  id: objectIdSchema,
});

export const createTicketSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().min(1, "Description is required").max(5000),
  priority: ticketPrioritySchema.default("medium"),
  customerId: objectIdSchema.optional(),
}).strict();

export const ticketListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: ticketStatusSchema.optional(),
  assignedTo: z.union([objectIdSchema, z.literal("unassigned")]).optional(),
  department: z.string().trim().min(1).max(80).optional(),
}).strict();

export const updateTicketStatusSchema = z.object({
  status: ticketStatusSchema,
}).strict();

export const assignTicketSchema = z.object({
  employeeId: objectIdSchema.or(z.literal("")),
}).strict();

export const addTicketCommentSchema = z.object({
  text: z.string().trim().min(1, "Comment is required").max(2000),
  isInternal: z.boolean().optional().default(false),
}).strict();
