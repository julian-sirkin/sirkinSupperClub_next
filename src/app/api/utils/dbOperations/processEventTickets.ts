import { addTicket } from "./addTicket";
import { updateTicket } from "./updateTicket";
import { findTicketByContentfulId } from "@/app/api/queries/select";

type SyncResults = {
  ticketsCreated: number;
  ticketsUpdated: number;
  errors: string[];
};

/**
 * Process all tickets for a given event
 * @param eventId The ID of the event these tickets belong to
 * @param eventTitle The title of the event (for logging)
 * @param tickets The tickets to process
 * @param syncResults Object to track sync statistics
 * @returns Updated syncResults
 */
export async function processEventTickets(
  eventId: number,
  eventTitle: string,
  tickets: {
    contentfulTicketId: string;
    title: string;
    time: any;
    ticketsAvailable?: number;
  }[],
  syncResults: SyncResults
): Promise<SyncResults> {
  // Create a new results object to avoid modifying the input directly
  const results = { ...syncResults };
  
  console.log(`Processing ${tickets.length} tickets`);
  
  for (const ticket of tickets) {
    try {
      console.log(`Processing ticket: ${ticket.contentfulTicketId}, title: ${ticket.title}`);
      
      // Check if ticket exists using the query function
      const existingTickets = await findTicketByContentfulId(ticket.contentfulTicketId);
      
      if (existingTickets.length === 0) {
        // Create new ticket
        console.log(`Creating new ticket for event: ${eventTitle}`);
        await addTicket({
          contentfulId: ticket.contentfulTicketId,
          event: eventId,
          time: ticket.time,
          totalAvailable: ticket.ticketsAvailable || 10
        });
        results.ticketsCreated++;
      } else {
        // Update existing ticket
        console.log(`Updating existing ticket for event: ${eventTitle}`);
        await updateTicket(existingTickets[0].id, {
          time: ticket.time,
          totalAvailable: ticket.ticketsAvailable || existingTickets[0].totalAvailable
        });
        results.ticketsUpdated++;
      }
    } catch (ticketError: any) {
      const errorMessage = ticketError?.message || String(ticketError);
      console.error(`Ticket processing error: ${errorMessage}`);
      results.errors.push(`Ticket ${ticket.title || ticket.contentfulTicketId}: ${errorMessage}`);
    }
  }
  
  return results;
} 