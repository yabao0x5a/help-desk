import * as ticketRepository from "./ticket.repository.js";
import { ConflictError, NotFoundError, NotImplementedError } from "../../shared/errors.js";
import {
  TicketFilters,
  CreateTicketDto,
  UpdateTicketDto,
  TicketStatus,
} from "./ticket.types.js";

const calculateSlaDeadline = (priority: string): Date => {
  const now = new Date();
  const hourMs = 60 * 60 * 1000;

  const slaHours: Record<string, number> = {
    urgent: 4,
    high: 8,
    medium: 24,
    low: 72,
  };

  const hours = slaHours[priority] || 24;
  return new Date(now.getTime() + hours * hourMs);
};

const isValidStatusTransition = (
  current: TicketStatus,
  next: TicketStatus,
): boolean => {
  const validTransitions: Record<TicketStatus, TicketStatus[]> = {
    open: ["in_progress"],
    in_progress: ["resolved", "open"],
    resolved: ["closed", "open"],
    closed: ["open"],
  };

  return validTransitions[current]?.includes(next) || false;
};

export const getAllTickets = async (filters: TicketFilters) => {
  const page = filters.page || 1;
  const limit = filters.limit || 10;

  const { results, totalCount } = await ticketRepository.findAll(filters);
  const totalPages = Math.ceil(totalCount / limit);

  return {
    success: true,
    data: results,
    pagination: {
      page,
      limit,
      totalItems: totalCount,
      totalPages,
    },
  };
};

export const getTicketById = async (id: number) => {
  const ticket = await ticketRepository.findById(id);
  if (!ticket) {
    throw new NotFoundError(`Ticket with id ${id} not found`);
  }

  return {
    success: true,
    data: ticket,
  };
};

// Done 🔴 TODO: Create a new ticket
// - use calculateSlaDeadline(data.priority) to compute the slaDeadline
// - create the ticket via the repository (pass data + slaDeadline)
// successful response schema:
// {
//   success: true,
//   data: ticket,
//   message: "Ticket created successfully"
// }
export const createTicket = async (data: CreateTicketDto) => {
  // throw new NotImplementedError("TODO: Implement backend logic for: createTicket in ticket.service.ts");
  const ticket = await ticketRepository.create({
    ...data,
    slaDeadline: calculateSlaDeadline(data.priority)
  })

  return {
    success: true,
    data: ticket,
    message: "Ticket created successfully"
  }

};

// Done 🔴 TODO: Update an existing ticket
// - if the ticket does not exist, throw NotFoundError
// - update the ticket via the repository
// successful response schema:
// {
//   success: true,
//   data: ticket,
//   message: "Ticket updated successfully"
// }
export const updateTicket = async (id: number, data: UpdateTicketDto) => {
  // throw new NotImplementedError("TODO: Implement backend logic for: updateTicket in ticket.service.ts");
  await getTicketById(id)
  const ticket = await ticketRepository.update(id, data)

  return {
    success: true,
    data: ticket,
    message: "Ticket updated successfully"
  }
};

// Done 🔴 TODO: Update ticket status
// - if the ticket does not exist, throw NotFoundError
// - validate the transition using isValidStatusTransition(currentStatus, newStatus)
//   if invalid, throw ConflictError
// - when transitioning to "resolved", set resolvedAt = new Date()
// - when transitioning to "closed", set closedAt = new Date()
// - update via the repository, passing the new status and timestamps
// successful response schema:
// {
//   success: true,
//   data: updatedTicket,
//   message: "Ticket status updated successfully"
// }
export const updateTicketStatus = async (id: number, newStatus: TicketStatus) => {
  // throw new NotImplementedError("TODO: Implement backend logic for: updateTicketStatus in ticket.service.ts");
  const {data: ticket } = await getTicketById(id)
  if(!isValidStatusTransition(ticket.status as TicketStatus, newStatus)) {
    throw new ConflictError(`Update failed from status ${ticket.status} to ${newStatus}`)
  }

  const timestamps: { resolvedAt?: Date, closedAt?: Date } = {}
  if (newStatus === 'resolved') {
    timestamps.resolvedAt = new Date()
  }

  if (newStatus === 'closed') {
    timestamps.closedAt = new Date()
  }

  const updatedTicket = await ticketRepository.updateStatus(id, newStatus, timestamps)

  return {
    success: true,
    data: updatedTicket,
    message: "Ticket status updated successfully"
  }
};

// Done 🔴 TODO: Delete a ticket
// - if the ticket does not exist, throw NotFoundError
// - otherwise delete via the repository
// successful response schema:
// {
//   success: true,
//   message: "Ticket deleted successfully"
// }
export const deleteTicket = async (id: number) => {
  // throw new NotImplementedError("TODO: Implement backend logic for: deleteTicket in ticket.service.ts");
  await getTicketById(id)
  await ticketRepository.deleteById(id)
  return {
    success: true,
    message: "Ticket deleted successfully"
  }
};
