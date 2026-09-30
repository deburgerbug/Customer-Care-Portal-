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

const router = express.Router();

router.use(authenticate);

// Metrics (used for notification badges)
router.get("/metrics", getMetrics);

// Core CRUD
router.post("/", requirePermission(PERMISSIONS.TICKET_CREATE), createTicket);
router.get("/", requirePermission(PERMISSIONS.TICKET_READ), getTickets);
router.get("/:id", requirePermission(PERMISSIONS.TICKET_READ), getTicketById);

// Update Status (Admin and Employee only)
router.patch("/:id/status", requirePermission(PERMISSIONS.TICKET_UPDATE), updateTicketStatus);

// Assign Ticket (Admin only)
router.patch("/:id/assign", requirePermission(PERMISSIONS.TICKET_ASSIGN), assignTicket);

// Comments
router.post("/:id/comments", requirePermission(PERMISSIONS.TICKET_COMMENT), addComment);

export default router;
