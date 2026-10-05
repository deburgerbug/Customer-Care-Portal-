import Ticket from "../modals/ticket.schema.js";
import Customer from "../modals/customer.schema.js";

/**
 * Filter tickets based on role:
 * - Admin: Sees all tickets
 * - Employee: Sees tickets assigned to them OR tickets belonging to customers assigned to them.
 * - Customer: Sees only their own tickets.
 */
async function getTicketAuthFilter(user) {
  if (user.role === "admin" || user.role === "employee") return {};
  return { customerId: user.customerId };
}

export async function createTicket(ticketData, user) {
  if (user.role === "customer" && !user.customerId) {
    throw new Error("You must complete your customer profile before creating a support ticket.");
  }

  // Force the customerId to be the logged-in customer if they are creating it
  if (user.role === "customer") {
    ticketData.customerId = user.customerId;
  }

  const ticket = await Ticket.create(ticketData);
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
  
  if (!ticket) throw new Error("Ticket not found");
  
  if (user.role === "employee" && ticket.assignedTo?.toString() !== user.id?.toString()) {
    throw new Error("You can only update tickets assigned to you.");
  }

  ticket.status = status;
  await ticket.save();
  return ticket;
}

export async function addComment(ticketId, text, isInternal, user) {
  const filter = await getTicketAuthFilter(user);
  const ticket = await Ticket.findOne({ _id: ticketId, ...filter });
  
  if (!ticket) {
    throw new Error("Ticket not found");
  }

  if (user.role === "employee" && ticket.assignedTo?.toString() !== user.id?.toString()) {
    throw new Error("You can only comment on tickets assigned to you.");
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

  await ticket.save();
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

  const ticket = await Ticket.findByIdAndUpdate(
    ticketId,
    { assignedTo: employeeId || null },
    { new: true }
  ).populate("assignedTo", "name email");

  return ticket;
}
