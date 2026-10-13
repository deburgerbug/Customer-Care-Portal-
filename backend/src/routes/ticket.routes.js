import express from "express";
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  addComment,
  getMetrics,
  assignTicket,
} from "../controller/ticket.controller.js";
import { authenticate, requirePermission } from "../middleware/auth.middleware.js";
import { PERMISSIONS } from "../config/permissions.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  addTicketCommentSchema,
  assignTicketSchema,
  createTicketSchema,
  ticketIdParamsSchema,
  ticketListQuerySchema,
  updateTicketStatusSchema,
} from "../validators/ticket.validator.js";

const router = express.Router();

router.use(authenticate);

// Metrics (used for notification badges)
router.get("/metrics", getMetrics);

// Core CRUD
router.post(
  "/",
  requirePermission(PERMISSIONS.TICKET_CREATE),
  validate({ body: createTicketSchema }),
  createTicket
);
router.get(
  "/",
  requirePermission(PERMISSIONS.TICKET_READ),
  validate({ query: ticketListQuerySchema }),
  getTickets
);
router.get(
  "/:id",
  requirePermission(PERMISSIONS.TICKET_READ),
  validate({ params: ticketIdParamsSchema }),
  getTicketById
);

// Update Status (Admin and Employee only)
router.patch(
  "/:id/status",
  requirePermission(PERMISSIONS.TICKET_UPDATE),
  validate({ params: ticketIdParamsSchema, body: updateTicketStatusSchema }),
  updateTicketStatus
);

// Assign Ticket (Admin only)
router.patch(
  "/:id/assign",
  requirePermission(PERMISSIONS.TICKET_ASSIGN),
  validate({ params: ticketIdParamsSchema, body: assignTicketSchema }),
  assignTicket
);

// Comments
router.post(
  "/:id/comments",
  requirePermission(PERMISSIONS.TICKET_COMMENT),
  validate({ params: ticketIdParamsSchema, body: addTicketCommentSchema }),
  addComment
);

export default router;
