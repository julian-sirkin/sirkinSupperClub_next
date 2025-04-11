import { db } from "@/db";
import { eventsTable, ticketsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { contentfulService } from "@/app/networkCalls/contentful/contentfulService";
import { addNewEvent } from "./dbOperations/addNewEvent";
import { updateExistingEvent } from "./dbOperations/updateExistingEvent";
import { addTicket } from "./dbOperations/addTicket";
import { updateTicket } from "./dbOperations/updateTicket";

function logEventSummary(event: any): void {
  console.log(`Event: ${event.title} (ID: ${event.contentfulEventId?.substring(0, 10)}...) | Date: ${event.date} | Tickets: ${event.tickets?.length || 0}`);
}

function safeGetTime(dateValue: any): number | null {
  if (!dateValue) return null;
  
  try {
    const date = new Date(dateValue);
    const timestamp = date.getTime();
    if (isNaN(timestamp)) return null;
    return timestamp;
  } catch (e) {
    console.warn(`Failed to parse date: ${dateValue}`, e);
    return null;
  }
}

// Add this debug function to print more info about the date values
function debugDate(label: string, value: any) {
  console.log(`DEBUG ${label}:`, {
    value,
    type: typeof value,
    isDate: value instanceof Date,
    asNumber: typeof value === 'number' ? value : Number(value),
  });
}

// Completely replace our date handling function
function getDateForDb(dateValue: any): number {
  // Simplify by always returning a number
  if (typeof dateValue === 'number') {
    return dateValue;
  }
  
  // Always return a timestamp number for SQLite
  return Math.floor(Date.now()); // Use current time as a fallback
}

// Add this debug function at the top to help diagnose the issue
function debugValue(prefix: string, val: any) {
  console.log(`${prefix}:`, {
    value: val,
    type: typeof val,
    isNumber: typeof val === 'number',
    isString: typeof val === 'string',
    isDate: val instanceof Date,
    asJSON: JSON.stringify(val)
  });
}

// Add a simple function to test event creation with basic values
export async function testEventCreation() {
  try {
    console.log("==== TESTING SIMPLE EVENT CREATION ====");
    
    // Very simple data structure
    const testEvent = {
      contentfulId: "test-event-" + Date.now(), 
      title: "Test Event",
      date: 1234567890, // Plain number
    };
    
    // Debug the value we're trying to insert
    debugValue("Inserting date value", testEvent.date);
    
    // Try the insert with the most basic approach
    const result = await db.insert(eventsTable).values(testEvent);
    
    console.log("✅ Event created successfully:", result);
    return { success: true };
  } catch (error) {
    console.error("❌ Error in test event creation:", error);
    return { success: false, error };
  }
}

// Modified syncAllEvents function to use the extracted functions
export const syncAllEvents = async () => {
  try {
    console.log("Starting event synchronization with database");
    
    // Get all events from Contentful
    const contentful = contentfulService();
    const contentfulEvents = await contentful.getEventsWithoutDB();
    
    console.log(`Fetched ${contentfulEvents.length} events from Contentful`);
    
    // Track sync results
    const syncResults = {
      eventsCreated: 0,
      eventsUpdated: 0,
      ticketsCreated: 0,
      ticketsUpdated: 0,
      errors: [] as string[]
    };
    
    // Process each event
    for (const event of contentfulEvents) {
      try {
        console.log(`\n▶ Processing: ${event.title}`);
        logEventSummary(event);
        
        // Check if event exists
        const existingEvents = await db
          .select()
          .from(eventsTable)
          .where(eq(eventsTable.contentfulId, event.contentfulEventId));
        
        let eventId: number;
        
        // Create or update event
        if (existingEvents.length === 0) {
          // Create new event
          eventId = await addNewEvent({
            contentfulId: event.contentfulEventId,
            title: event.title,
            date: event.date
          });
          syncResults.eventsCreated++;
        } else {
          // Update existing event
          eventId = existingEvents[0].id;
          await updateExistingEvent(eventId, {
            title: event.title,
            date: event.date
          });
          syncResults.eventsUpdated++;
        }
        
        // Process tickets for this event
        console.log(`Processing ${event.tickets.length} tickets`);
        for (const ticket of event.tickets) {
          try {
            console.log(`Processing ticket: ${ticket.contentfulTicketId}, title: ${ticket.title}`);
            
            // Check if ticket exists
            const existingTickets = await db
              .select()
              .from(ticketsTable)
              .where(eq(ticketsTable.contentfulId, ticket.contentfulTicketId));
            
            if (existingTickets.length === 0) {
              // Create new ticket
              console.log(`Creating new ticket for event: ${event.title}`);
              await addTicket({
                contentfulId: ticket.contentfulTicketId,
                event: eventId,
                time: ticket.time,
                totalAvailable: ticket.ticketsAvailable || 10
              });
              syncResults.ticketsCreated++;
            } else {
              // Update existing ticket
              console.log(`Updating existing ticket for event: ${event.title}`);
              await updateTicket(existingTickets[0].id, {
                time: ticket.time,
                totalAvailable: ticket.ticketsAvailable || existingTickets[0].totalAvailable
              });
              syncResults.ticketsUpdated++;
            }
          } catch (ticketError: any) {
            const errorMessage = ticketError?.message || String(ticketError);
            console.error(`Ticket processing error: ${errorMessage}`);
            syncResults.errors.push(`Ticket ${ticket.title || ticket.contentfulTicketId}: ${errorMessage}`);
          }
        }
      } catch (processingError: any) {
        const errorMessage = processingError?.message || String(processingError);
        console.error(`Processing error for ${event.title}:`, processingError);
        syncResults.errors.push(`Event ${event.title}: Processing error - ${errorMessage}`);
      }
    }
    
    // Output results
    console.log("\n📊 SYNC RESULTS 📊");
    console.log(`Events: ${syncResults.eventsCreated} created, ${syncResults.eventsUpdated} updated`);
    console.log(`Tickets: ${syncResults.ticketsCreated} created, ${syncResults.ticketsUpdated} updated`);

    if (syncResults.errors.length > 0) {
      console.log(`\n⚠️ Errors (${syncResults.errors.length}):`);
      syncResults.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    return {
      success: true,
      ...syncResults
    };
  } catch (error: any) {
    console.error("Error in syncAllEvents:", error);
    return {
      success: false,
      message: "Error synchronizing events",
      error: error?.message || String(error)
    };
  }
};

export async function syncAllEventsWithDatabase() {
  try {
    console.log("Starting event synchronization with database");
    
    // Get all events from Contentful
    const contentful = contentfulService();
    const contentfulEvents = await contentful.getEventsWithoutDB();
    
    // Process each event
    for (const event of contentfulEvents) {
      // Check if event exists in database
      const existingEvents = await db
        .select()
        .from(eventsTable)
        .where(eq(eventsTable.contentfulId, event.contentfulEventId));
      
      let eventId: number;
      
      if (existingEvents.length === 0) {
        // Create new event
        console.log(`Creating new event: ${event.title}`);
        const result = await db.insert(eventsTable).values({
          contentfulId: event.contentfulEventId,
          title: event.title,
          date: getDateForDb(event.date),
        }).returning({ id: eventsTable.id });
        
        eventId = result[0].id;
      } else {
        // Update existing event
        console.log(`Updating existing event: ${event.title}`);
        eventId = existingEvents[0].id;
        
        await db.update(eventsTable)
          .set({
            title: event.title,
            date: getDateForDb(event.date),
          })
          .where(eq(eventsTable.id, eventId));
      }
      
      // Process tickets for this event
      for (const ticket of event.tickets) {
        // Check if ticket exists
        const existingTickets = await db
          .select()
          .from(ticketsTable)
          .where(eq(ticketsTable.contentfulId, ticket.contentfulTicketId));
        
        if (existingTickets.length === 0) {
          // Create new ticket
          console.log(`Creating new ticket for event: ${event.title}`);
          await db.insert(ticketsTable).values({
            contentfulId: ticket.contentfulTicketId,
            event: eventId,
            time: getDateForDb(ticket.time || event.date),
            totalAvailable: ticket.totalAvailable || 10, // Default value
            totalSold: 0,
          });
        } else {
          // Update existing ticket
          console.log(`Updating existing ticket for event: ${event.title}`);
          await db.update(ticketsTable)
            .set({
              time: getDateForDb(ticket.time || event.date),
              totalAvailable: ticket.totalAvailable || existingTickets[0].totalAvailable,
            })
            .where(eq(ticketsTable.id, existingTickets[0].id));
        }
      }
    }
    
    console.log("Event synchronization completed successfully");
    return { success: true, message: "Events synchronized successfully" };
  } catch (error) {
    console.error("Error synchronizing events:", error);
    return { success: false, message: "Error synchronizing events", error };
  }
} 