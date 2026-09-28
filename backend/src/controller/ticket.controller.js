import * as ticketService from "../service/ticket.service.js";

export async function createTicket(req, res, next) {
  try {
    const ticket = await ticketService.createTicket(req.body, req.user);
    res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTickets(req, res, next) {
  try {
    const data = await ticketService.getTickets(req.query, req.user);
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTicketById(req, res, next) {
  try {
    const ticket = await ticketService.getTicketById(req.params.id, req.user);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }
    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTicketStatus(req, res, next) {
  try {
    const ticket = await ticketService.updateTicketStatus(req.params.id, req.body.status, req.user);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }
    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
}

export async function addComment(req, res, next) {
  try {
    const { text, isInternal } = req.body;
    const ticket = await ticketService.addComment(req.params.id, text, isInternal, req.user);
    res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMetrics(req, res, next) {
  try {
    // Only Admin can see total unread tickets
    let openTickets = 0;
    if (req.user.role === "admin") {
      openTickets = await ticketService.getOpenTicketCount();
    }
    
    res.status(200).json({
      success: true,
      data: {
        openTickets,
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function assignTicket(req, res, next) {
  try {
    const ticket = await ticketService.assignTicket(req.params.id, req.body.employeeId, req.user);
    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
}
