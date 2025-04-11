import { updateEvent } from "@/app/api/queries/update";

// Helper function to convert any date value to a safe format for SQLite
const prepareDateForDb = (dateValue: any): number => {
  // If it's already a number, just return it
  if (typeof dateValue === 'number') {
    return dateValue;
  }
  
  try {
    // If it's a Date object or string, convert to milliseconds timestamp
    const timestamp = new Date(dateValue).getTime();
    if (isNaN(timestamp)) {
      return Math.floor(Date.now()); // Fallback to current time
    }
    return timestamp;
  } catch (error) {
    console.error("Error converting date:", error);
    return Math.floor(Date.now()); // Fallback to current time
  }
}

/**
 * Updates an existing event in the database
 * @param eventId The ID of the event to update
 * @param eventData The updated event data
 */
export async function updateExistingEvent(
  eventId: number,
  eventData: {
    title: string;
    date: any; // Could be Date, string, number, etc.
  }
) {
  try {
    console.log(`✎ Updating event ID ${eventId}: ${eventData.title}`);
    
    // Again, use Date objects not timestamps
    const updateData = {
      title: eventData.title,
      date: eventData.date instanceof Date ? eventData.date : new Date(eventData.date)
    };
    
    // Use the dedicated query function
    await updateEvent(eventId, updateData);
    
    console.log(`✅ Event ${eventId} updated successfully`);
  } catch (error) {
    console.error(`❌ Error updating event ${eventId}:`, error);
    throw error;
  }
} 