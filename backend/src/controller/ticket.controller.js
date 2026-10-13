import * as ticketService from "../services/ticket.service.js";
import { AppError } from "../errors/AppError.js";

export async function createTicket(req, res, next) {
  try {
    const ticket = await ticketService.createTicket(req.validated.body, req.user);
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
    const data = await ticketService.getTickets(req.validated.query, req.user);
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
    const ticket = await ticketService.getTicketById(req.validated.params.id, req.user);
    if (!ticket) {
      return next(new AppError("Ticket not found", {
        statusCode: 404,
        errorCode: "TICKET_NOT_FOUND",
      }));
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
    const ticket = await ticketService.updateTicketStatus(
      req.validated.params.id,
      req.validated.body.status,
      req.user
    );
    if (!ticket) {
      return next(new AppError("Ticket not found", {
        statusCode: 404,
        errorCode: "TICKET_NOT_FOUND",
      }));
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
    const { text, isInternal } = req.validated.body;
    const ticket = await ticketService.addComment(
      req.validated.params.id,
      text,
      isInternal,
      req.user
    );
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
    const ticket = await ticketService.assignTicket(
      req.validated.params.id,
      req.validated.body.employeeId,
      req.user
    );
    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
}
