import { contentfulService } from "@/app/networkCalls/contentful/contentfulService";
import { addNewEvent } from "./dbOperations/addNewEvent";
import { updateExistingEvent } from "./dbOperations/updateExistingEvent";
import { findEventByContentfulId } from "@/app/api/queries/select";
import { processEventTickets } from "./dbOperations/processEventTickets";

export const syncAllEvents = async () => {
  try {
    const contentful = contentfulService();
    const contentfulEvents = await contentful.getEventsWithoutDB();

    const syncResults = {
      eventsCreated: 0,
      eventsUpdated: 0,
      ticketsCreated: 0,
      ticketsUpdated: 0,
      errors: [] as string[],
    };

    for (const event of contentfulEvents) {
      try {
        const existingEvents = await findEventByContentfulId(event.contentfulEventId);
        let eventId: number;

        if (existingEvents.length === 0) {
          eventId = await addNewEvent({
            contentfulId: event.contentfulEventId,
            title: event.title,
            date: event.date,
          });
          syncResults.eventsCreated += 1;
        } else {
          eventId = existingEvents[0].id;
          await updateExistingEvent(eventId, {
            title: event.title,
            date: event.date,
          });
          syncResults.eventsUpdated += 1;
        }

        const updatedResults = await processEventTickets(
          eventId,
          event.title,
          event.tickets,
          syncResults
        );

        syncResults.ticketsCreated = updatedResults.ticketsCreated;
        syncResults.ticketsUpdated = updatedResults.ticketsUpdated;
        syncResults.errors = updatedResults.errors;
      } catch (processingError) {
        const errorMessage = processingError instanceof Error
          ? processingError.message
          : String(processingError);
        console.error(`Failed to sync ${event.title}:`, processingError);
        syncResults.errors.push(`${event.title}: ${errorMessage}`);
      }
    }

    return {
      success: true,
      eventsCreated: syncResults.eventsCreated,
      eventsUpdated: syncResults.eventsUpdated,
      ticketsCreated: syncResults.ticketsCreated,
      ticketsUpdated: syncResults.ticketsUpdated,
      warnings: syncResults.errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Event sync failed:", error);
    return {
      success: false,
      message: "Error synchronizing events",
      error: errorMessage,
    };
  }
};
