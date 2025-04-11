import { contentfulService } from "@/app/networkCalls/contentful/contentfulService";
import { addNewEvent } from "./dbOperations/addNewEvent";
import { updateExistingEvent } from "./dbOperations/updateExistingEvent";
import { findEventByContentfulId } from "@/app/api/queries/select";
import { processEventTickets } from "./dbOperations/processEventTickets";

function logEventSummary(event: any): void {
  console.log(`Event: ${event.title} (ID: ${event.contentfulEventId?.substring(0, 10)}...) | Date: ${event.date} | Tickets: ${event.tickets?.length || 0}`);
}

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
        
        // Check if event exists using the query function
        const existingEvents = await findEventByContentfulId(event.contentfulEventId);
        
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
        
        // Process all tickets for this event using our dedicated function
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