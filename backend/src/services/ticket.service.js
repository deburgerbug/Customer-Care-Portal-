import Ticket from "../models/ticket.schema.js";
import Customer from "../models/customer.schema.js";
import User from "../models/user.schema.js"
import { findActiveDepartment } from "./department.service.js";
import { createAuditLog } from "./auditLogs.service.js";
import { AppError } from "../errors/AppError.js";

function ticketError(message, statusCode, errorCode) {
  return new AppError(message, { statusCode, errorCode });
}
/**
 * Filter tickets based on role:
 * - Admin: Sees all tickets
 * - Employee: Sees tickets assigned to them OR tickets belonging to customers assigned to them.
 * - Customer: Sees only their own tickets.
 */
async function getTicketAuthFilter(user) {
  if (user.role === "admin") return {};
  if (user.role === "employee") return { assignedTo: user.id || user._id };
  return { customerId: user.customerId };
}

export async function createTicket(ticketData, user) {
  if (user.role === "customer" && !user.customerId) {
    throw ticketError(
      "You must complete your customer profile before creating a support ticket.",
      400,
      "CUSTOMER_PROFILE_REQUIRED"
    );
  }

  // Force the customerId to be the logged-in customer if they are creating it
  if (user.role === "customer") {
    ticketData.customerId = user.customerId;
  }

  const ticket = await Ticket.create(ticketData);
  await createAuditLog({
    entity: ticket._id,
    actor: user.id || user._id,
    action: "created",
    changes: {
      status: ticket.status,
      priority: ticket.priority,
      customerId: ticket.customerId,
      assignedTo: ticket.assignedTo,
    },
    description: "Ticket created",
  });
  return ticket;
}

export async function getTickets(queryOptions = {}, user) {
  const page = Math.max(1, parseInt(queryOptions.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(queryOptions.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = await getTicketAuthFilter(user);

  // Status filter
  if (queryOptions.status) {
    filter.status = queryOptions.status;
  }

  // AssignedTo filter (can be an employee ID or "unassigned")
  if (queryOptions.assignedTo) {
    if (queryOptions.assignedTo === "unassigned") {
      filter.assignedTo = null;
    } else {
      filter.assignedTo = queryOptions.assignedTo;
    }
  }
  //Department Filter (select from department fields)
  if (queryOptions.department) {
    const department = await findActiveDepartment(queryOptions.department);
    const employeeDept = department
      ? await User.find({ department: department._id }).select("_id")
      : [];
    const employeeIds = employeeDept.map(emp => emp._id);

    if (!filter.assignedTo) {
      filter.assignedTo = { $in: employeeIds };
    }
  }

  const [tickets, totalCount] = await Promise.all([
    Ticket.find(filter)
      .populate("customerId", "firstName lastName")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Ticket.countDocuments(filter),
  ]);

  let finalTickets = tickets;
  if (user.role === "customer") {
    finalTickets = tickets.map(t => {
      const tObj = t.toObject();
      tObj.comments = tObj.comments.filter(c => !c.isInternal);
      return tObj;
    });
  }

  return {
    tickets: finalTickets,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
    },
  };
}

export async function getTicketById(ticketId, user) {
  const filter = await getTicketAuthFilter(user);
  let ticket = await Ticket.findOne({
    _id: ticketId,
    ...filter,
  })
    .populate("customerId", "firstName lastName")
    .populate("assignedTo", "name email")
    .populate("comments.userId", "name role");

  if (!ticket) return null;

  // Mark as read if a staff member views it
  if (!ticket.isRead && (user.role === "admin" || user.role === "employee")) {
    ticket.isRead = true;
    await ticket.save();
  }

  // Scrub internal comments if user is a customer
  if (user.role === "customer") {
    // Need to convert mongoose doc to plain object to modify it freely
    const ticketObj = ticket.toObject();
    ticketObj.comments = ticketObj.comments.filter(c => !c.isInternal);
    return ticketObj;
  }

  return ticket;
}

export async function updateTicketStatus(ticketId, status, user) {
  const filter = await getTicketAuthFilter(user);
  const ticket = await Ticket.findOne({ _id: ticketId, ...filter });

  if (!ticket) throw ticketError("Ticket not found", 404, "TICKET_NOT_FOUND");

  if (user.role === "employee" && ticket.assignedTo?.toString() !== user.id?.toString()) {
    throw ticketError("You can only update tickets assigned to you.", 403, "TICKET_FORBIDDEN");
  }

  const previousStatus = ticket.status;
  ticket.status = status;
  await ticket.save();

  if (previousStatus !== ticket.status) {
    await createAuditLog({
      entity: ticket._id,
      actor: user.id || user._id,
      action: "status_changed",
      changes: {
        status: {
          from: previousStatus,
          to: ticket.status,
        },
      },
      description: `Ticket status changed from ${previousStatus} to ${ticket.status}`,
    });
  }

  return ticket;
}

export async function addComment(ticketId, text, isInternal, user) {
  const filter = await getTicketAuthFilter(user);
  const ticket = await Ticket.findOne({ _id: ticketId, ...filter });

  if (!ticket) {
    throw ticketError("Ticket not found", 404, "TICKET_NOT_FOUND");
  }

  if (user.role === "employee" && ticket.assignedTo?.toString() !== user.id?.toString()) {
    throw ticketError("You can only comment on tickets assigned to you.", 403, "TICKET_FORBIDDEN");
  }

  // Customers cannot add internal notes
  if (user.role === "customer") {
    isInternal = false;
  }

  ticket.comments.push({
    userId: user.id,
    text,
    isInternal,
  });

  const comment = ticket.comments[ticket.comments.length - 1];
  await ticket.save();
  await createAuditLog({
    entity: ticket._id,
    actor: user.id || user._id,
    action: "comment_added",
    changes: {
      commentId: comment._id,
      isInternal: comment.isInternal,
    },
    description: "Ticket comment added",
  });
  await ticket.populate("comments.userId", "name role");

  if (user.role === "customer") {
    const ticketObj = ticket.toObject();
    ticketObj.comments = ticketObj.comments.filter(c => !c.isInternal);
    return ticketObj;
  }

  return ticket;
}

export async function getOpenTicketCount() {
  // Count unread tickets for notification badge
  return await Ticket.countDocuments({ isRead: false });
}

export async function assignTicket(ticketId, employeeId, user) {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw ticketError("Ticket not found", 404, "TICKET_NOT_FOUND");
  }

  const previousAssignee = ticket.assignedTo?.toString() || null;
  ticket.assignedTo = employeeId || null;
  await ticket.save();

  const nextAssignee = ticket.assignedTo?.toString() || null;
  if (previousAssignee !== nextAssignee) {
    const isUnassigned = nextAssignee === null;
    await createAuditLog({
      entity: ticket._id,
      actor: user.id || user._id,
      action: isUnassigned ? "unassigned" : "assigned",
      changes: {
        assignedTo: {
          from: previousAssignee,
          to: nextAssignee,
        },
      },
      description: isUnassigned ? "Ticket unassigned" : "Ticket assigned",
    });
  }

  return ticket.populate("assignedTo", "name email");
}
