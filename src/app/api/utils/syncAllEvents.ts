import { contentfulService } from "@/app/networkCalls/contentful/contentfulService";
import { addNewEvent } from "./dbOperations/addNewEvent";
import { updateExistingEvent } from "./dbOperations/updateExistingEvent";
import { findEventByContentfulId } from "@/app/api/queries/select";
import { processEventTickets } from "./dbOperations/processEventTickets";
import { db } from "@/db";
import { eventsTable, ticketsTable } from "@/db/schema";

function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return String(obj);
  }
}

function logEventSummary(event: any): void {
  console.log(`Event: ${event.title} (ID: ${event.contentfulEventId?.substring(0, 10)}...) | Date: ${event.date} | Tickets: ${event.tickets?.length || 0}`);
}

export const syncAllEvents = async () => {
  try {
    console.log("=== SYNC START ===");
    console.log("Starting event synchronization with database");
    
    // Get current state of database BEFORE sync
    console.log("\n--- DATABASE STATE (BEFORE SYNC) ---");
    const dbEventsBefore = await db.select().from(eventsTable);
    const dbTicketsBefore = await db.select().from(ticketsTable);
    console.log(`Events in DB: ${dbEventsBefore.length}`);
    console.log(`Tickets in DB: ${dbTicketsBefore.length}`);
    console.log("DB Events (before): " + safeStringify(dbEventsBefore.map(e => ({
      id: e.id,
      title: e.title,
      date: e.date,
      contentfulId: e.contentfulId
    }))));
    console.log("DB Tickets (before): " + safeStringify(dbTicketsBefore.map(t => ({
      id: t.id,
      event: t.event,
      contentfulId: t.contentfulId,
      time: t.time,
      totalAvailable: t.totalAvailable,
      totalSold: t.totalSold
    }))));
    
    // Get all events from Contentful
    console.log("\n--- FETCHING FROM CONTENTFUL ---");
    const contentful = contentfulService();
    const contentfulEvents = await contentful.getEventsWithoutDB();
    
    console.log(`Fetched ${contentfulEvents.length} events from Contentful`);
    console.log("Contentful Events: " + safeStringify(contentfulEvents.map(e => ({
      contentfulEventId: e.contentfulEventId,
      title: e.title,
      date: e.date,
      tickets: e.tickets?.map(t => ({
        contentfulTicketId: t.contentfulTicketId,
        title: t.title,
        time: t.time,
        ticketsAvailable: t.ticketsAvailable,
        addonCount: t.addons?.length ?? 0,
        addons: (t.addons ?? []).map(addon => ({
          contentfulAddonId: addon.contentfulAddonId,
          title: addon.title,
          price: addon.price,
        })),
      })) || []
    }))));

    const contentfulTicketCount = contentfulEvents.reduce((count, event) => count + (event.tickets?.length ?? 0), 0);
    const contentfulTicketWithAddonsCount = contentfulEvents.reduce((count, event) => {
      const eventAddonTicketCount = (event.tickets ?? []).filter(ticket => (ticket.addons?.length ?? 0) > 0).length;
      return count + eventAddonTicketCount;
    }, 0);
    console.log(`Contentful sync summary: ${contentfulEvents.length} event(s), ${contentfulTicketCount} ticket(s), ${contentfulTicketWithAddonsCount} ticket(s) with addon mappings.`);
    
    // Track sync results
    const syncResults = {
      eventsCreated: 0,
      eventsUpdated: 0,
      ticketsCreated: 0,
      ticketsUpdated: 0,
      errors: [] as string[]
    };
    
    // Process each event
    console.log("\n--- PROCESSING EVENTS ---");
    for (const event of contentfulEvents) {
      try {
        console.log(`\n▶ Processing: ${event.title}`);
        console.log("Contentful Event Data: " + safeStringify({
          contentfulEventId: event.contentfulEventId,
          title: event.title,
          date: event.date,
          tickets: event.tickets?.map(t => ({
            contentfulTicketId: t.contentfulTicketId,
            title: t.title,
            time: t.time,
            ticketsAvailable: t.ticketsAvailable,
            addonCount: t.addons?.length ?? 0,
          })) || []
        }));
        const eventTicketsWithAddons = (event.tickets ?? []).filter(ticket => (ticket.addons?.length ?? 0) > 0).length;
        console.log(`Event ${event.title} has ${(event.tickets ?? []).length} ticket(s), ${eventTicketsWithAddons} ticket(s) with addons.`);
        logEventSummary(event);
        
        // Check if event exists using the query function
        const existingEvents = await findEventByContentfulId(event.contentfulEventId);
        console.log(`Existing events found: ${existingEvents.length}`);
        if (existingEvents.length > 0) {
          console.log("Existing Event in DB: " + safeStringify(existingEvents.map(e => ({
            id: e.id,
            title: e.title,
            date: e.date,
            contentfulId: e.contentfulId
          }))));
        }
        
        let eventId: number;
        
        // Create or update event
        if (existingEvents.length === 0) {
          // Create new event
          console.log(`Creating new event: ${event.title}`);
          eventId = await addNewEvent({
            contentfulId: event.contentfulEventId,
            title: event.title,
            date: event.date
          });
          syncResults.eventsCreated++;
          console.log(`Event created with ID: ${eventId}`);
        } else {
          // Update existing event
          eventId = existingEvents[0].id;
          console.log(`Updating existing event ID ${eventId}: ${event.title}`);
          await updateExistingEvent(eventId, {
            title: event.title,
            date: event.date
          });
          syncResults.eventsUpdated++;
          console.log(`Event ${eventId} updated successfully`);
        }
        
        // Process all tickets for this event using our dedicated function
        console.log(`Processing ${event.tickets?.length || 0} tickets for event ${eventId}`);
        const updatedResults = await processEventTickets(
          eventId,
          event.title,
          event.tickets,
          syncResults
        );
        
        // Update our sync results with the ticket processing results
        syncResults.ticketsCreated = updatedResults.ticketsCreated;
        syncResults.ticketsUpdated = updatedResults.ticketsUpdated;
        syncResults.errors = updatedResults.errors;
        
      } catch (processingError: any) {
        const errorMessage = processingError?.message || String(processingError);
        const errorStack = processingError?.stack || '';
        console.error(`Processing error for ${event.title}: ${errorMessage}`);
        console.error(`Error stack: ${errorStack}`);
        syncResults.errors.push(`Event ${event.title}: Processing error - ${errorMessage}`);
      }
    }
    
    // Get current state of database AFTER sync
    console.log("\n--- DATABASE STATE (AFTER SYNC) ---");
    const dbEventsAfter = await db.select().from(eventsTable);
    const dbTicketsAfter = await db.select().from(ticketsTable);
    console.log(`Events in DB: ${dbEventsAfter.length}`);
    console.log(`Tickets in DB: ${dbTicketsAfter.length}`);
    console.log("DB Events (after): " + safeStringify(dbEventsAfter.map(e => ({
      id: e.id,
      title: e.title,
      date: e.date,
      contentfulId: e.contentfulId
    }))));
    console.log("DB Tickets (after): " + safeStringify(dbTicketsAfter.map(t => ({
      id: t.id,
      event: t.event,
      contentfulId: t.contentfulId,
      time: t.time,
      totalAvailable: t.totalAvailable,
      totalSold: t.totalSold
    }))));
    
    // Output results
    console.log("\n--- SYNC RESULTS ---");
    console.log(`Events: ${syncResults.eventsCreated} created, ${syncResults.eventsUpdated} updated`);
    console.log(`Tickets: ${syncResults.ticketsCreated} created, ${syncResults.ticketsUpdated} updated`);
    console.log("Sync Results Summary: " + safeStringify(syncResults));

    const hasErrors = syncResults.errors.length > 0;
    if (hasErrors) {
      console.log(`\n⚠️ ERRORS DETECTED (${syncResults.errors.length}):`);
      syncResults.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
      console.log("All Errors: " + safeStringify(syncResults.errors));
    }
    
    console.log("\n=== SYNC COMPLETE ===");
    
    // Return success: false if there are any errors, even if some items were processed
    return {
      success: !hasErrors,
      hasPartialFailures: hasErrors,
      ...syncResults
    };
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    const errorStack = error?.stack || '';
    console.error("=== SYNC ERROR ===");
    console.error("Error in syncAllEvents: " + errorMessage);
    console.error("Error stack: " + errorStack);
    console.error("Full error: " + safeStringify(error));
    return {
      success: false,
      message: "Error synchronizing events",
      error: errorMessage
    };
  }
}; 