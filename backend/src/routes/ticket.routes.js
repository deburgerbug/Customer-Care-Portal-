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
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

// Metrics (used for notification badges)
router.get("/metrics", getMetrics);

// Core CRUD
router.post("/", authorize("customer", "admin", "employee"), createTicket);
router.get("/", authorize("customer", "admin", "employee"), getTickets);
router.get("/:id", authorize("customer", "admin", "employee"), getTicketById);

// Update Status (Admin and Employee only)
router.patch("/:id/status", authorize("admin", "employee"), updateTicketStatus);

// Assign Ticket (Admin only)
router.patch("/:id/assign", authorize("admin"), assignTicket);

// Comments
router.post("/:id/comments", authorize("customer", "admin", "employee"), addComment);

export default router;
