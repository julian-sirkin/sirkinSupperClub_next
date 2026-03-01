import { addTicket } from "./addTicket";
import { updateTicket } from "./updateTicket";
import { findTicketByContentfulId } from "@/app/api/queries/select";

type SyncResults = {
  ticketsCreated: number;
  ticketsUpdated: number;
  errors: string[];
};

function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return String(obj);
  }
}

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
  
  console.log(`Processing ${tickets.length} tickets for event ${eventId} (${eventTitle})`);
  console.log("Contentful Tickets Data: " + safeStringify(tickets.map(t => ({
    contentfulTicketId: t.contentfulTicketId,
    title: t.title,
    time: t.time,
    ticketsAvailable: t.ticketsAvailable
  }))));
  
  for (const ticket of tickets) {
    try {
      console.log(`Processing ticket: ${ticket.contentfulTicketId}, title: ${ticket.title}`);
      console.log("Ticket Data: " + safeStringify({
        contentfulTicketId: ticket.contentfulTicketId,
        title: ticket.title,
        time: ticket.time,
        ticketsAvailable: ticket.ticketsAvailable,
        eventId: eventId
      }));
      
      // Check if ticket exists using the query function
      const existingTickets = await findTicketByContentfulId(ticket.contentfulTicketId);
      console.log(`Existing tickets found: ${existingTickets.length}`);
      if (existingTickets.length > 0) {
        console.log("Existing Ticket in DB: " + safeStringify(existingTickets.map(t => ({
          id: t.id,
          event: t.event,
          contentfulId: t.contentfulId,
          time: t.time,
          totalAvailable: t.totalAvailable,
          totalSold: t.totalSold
        }))));
      }
      
      if (existingTickets.length === 0) {
        // Create new ticket
        console.log(`Creating new ticket for event: ${eventTitle}`);
        const newTicketData = {
          contentfulId: ticket.contentfulTicketId,
          event: eventId,
          time: ticket.time,
          totalAvailable: ticket.ticketsAvailable || 10
        };
        console.log("New Ticket Data: " + safeStringify(newTicketData));
        await addTicket(newTicketData);
        results.ticketsCreated++;
        console.log(`Ticket created successfully`);
      } else {
        // Update existing ticket - also update event association if it's different
        const existingTicket = existingTickets[0];
        const needsEventUpdate = existingTicket.event !== eventId;
        
        if (needsEventUpdate) {
          console.log(`⚠️  Ticket ${ticket.contentfulTicketId} was linked to event ${existingTicket.event}, updating to event ${eventId}`);
        }
        
        console.log(`Updating existing ticket for event: ${eventTitle}`);
        const updateData = {
          event: eventId,
          time: ticket.time,
          totalAvailable: ticket.ticketsAvailable || existingTicket.totalAvailable
        };
        console.log("Update Ticket Data: " + safeStringify(updateData));
        await updateTicket(existingTicket.id, updateData);
        results.ticketsUpdated++;
        console.log(`Ticket ${existingTicket.id} updated successfully`);
      }
    } catch (ticketError: any) {
      const errorMessage = ticketError?.message || String(ticketError);
      const errorStack = ticketError?.stack || '';
      console.error(`Ticket processing error: ${errorMessage}`);
      console.error(`Error stack: ${errorStack}`);
      console.error("Full error: " + safeStringify(ticketError));
      results.errors.push(`Ticket ${ticket.title || ticket.contentfulTicketId}: ${errorMessage}`);
    }
  }
  
  console.log(`Ticket processing complete: ${results.ticketsCreated} created, ${results.ticketsUpdated} updated, ${results.errors.length} errors`);
  
  return results;
} 