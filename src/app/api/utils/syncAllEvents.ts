import { db } from "@/db";
import { eventsTable, ticketsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { contentfulService } from "@/app/networkCalls/contentful/contentfulService";

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
      errors: []
    };
    
    // Process each event
    for (const event of contentfulEvents) {
      try {
        console.log(`Processing event: ${event.title} (ID: ${event.contentfulEventId})`);
        
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
            title: event.title || "Untitled Event",
            date: new Date(event.date).getTime(),
          }).returning({ id: eventsTable.id });
          
          eventId = result[0].id;
          syncResults.eventsCreated++;
        } else {
          // Update existing event
          console.log(`Updating existing event: ${event.title}`);
          eventId = existingEvents[0].id;
          
          await db.update(eventsTable)
            .set({
              title: event.title || existingEvents[0].title,
              date: new Date(event.date).getTime(),
            })
            .where(eq(eventsTable.id, eventId));
          
          syncResults.eventsUpdated++;
        }
        
        // Process tickets for this event
        console.log(`Processing ${event.tickets?.length || 0} tickets for event: ${event.title}`);
        
        if (!event.tickets || event.tickets.length === 0) {
          console.warn(`No tickets found for event: ${event.title}`);
          continue;
        }
        
        for (const ticket of event.tickets) {
          try {
            console.log(`Processing ticket: ${ticket.contentfulTicketId}`);
            
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
                time: new Date(ticket.time).getTime(),
                totalAvailable: ticket.totalAvailable || 10, // Default value
                totalSold: 0,
              });
              
              syncResults.ticketsCreated++;
            } else {
              // Update existing ticket
              console.log(`Updating existing ticket for event: ${event.title}`);
              await db.update(ticketsTable)
                .set({
                  time: new Date(ticket.time).getTime(),
                  totalAvailable: ticket.totalAvailable || existingTickets[0].totalAvailable,
                })
                .where(eq(ticketsTable.id, existingTickets[0].id));
              
              syncResults.ticketsUpdated++;
            }
          } catch (ticketError) {
            console.error(`Error processing ticket ${ticket.contentfulTicketId}:`, ticketError);
            syncResults.errors.push(`Ticket ${ticket.contentfulTicketId}: ${ticketError.message}`);
          }
        }
      } catch (eventError) {
        console.error(`Error processing event ${event.contentfulEventId}:`, eventError);
        syncResults.errors.push(`Event ${event.contentfulEventId}: ${eventError.message}`);
      }
    }
    
    console.log("Event synchronization completed with results:", syncResults);
    return { 
      success: true, 
      message: "Events synchronized successfully", 
      results: syncResults 
    };
  } catch (error) {
    console.error("Error synchronizing events:", error);
    return { success: false, message: "Error synchronizing events", error };
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
          date: new Date(event.date).getTime(),
        }).returning({ id: eventsTable.id });
        
        eventId = result[0].id;
      } else {
        // Update existing event
        console.log(`Updating existing event: ${event.title}`);
        eventId = existingEvents[0].id;
        
        await db.update(eventsTable)
          .set({
            title: event.title,
            date: new Date(event.date).getTime(),
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
            time: new Date(ticket.time).getTime(),
            totalAvailable: ticket.totalAvailable || 10, // Default value
            totalSold: 0,
          });
        } else {
          // Update existing ticket
          console.log(`Updating existing ticket for event: ${event.title}`);
          await db.update(ticketsTable)
            .set({
              time: new Date(ticket.time).getTime(),
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