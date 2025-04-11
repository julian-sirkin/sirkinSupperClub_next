import { db } from "@/db";
import { eventsTable } from "@/db/schema";

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
 * Adds a new event to the database
 * @param eventData The event data to add
 * @returns The ID of the newly created event
 */
export async function addNewEvent(eventData: {
  contentfulId: string;
  title: string;
  date: any;
}) {
  try {
    console.log(`➕ Adding new event: ${eventData.title}`);
    
    // The key insight: Drizzle's SQLite timestamp expects a Date object!
    // The error occurs because we're trying to be too clever with conversion
    const eventToInsert = {
      contentfulId: eventData.contentfulId,
      title: eventData.title,
      // Use the date directly, don't convert to timestamp number
      date: eventData.date instanceof Date ? eventData.date : new Date(eventData.date)
    };
    
    // Log what we're inserting for debugging
    console.log("Event data for insertion:", {
      ...eventToInsert,
      date: eventToInsert.date.toString()
    });
    
    // Insert with explicit fields and return the ID
    const result = await db.insert(eventsTable).values(eventToInsert).returning({ id: eventsTable.id });
    
    if (!result || result.length === 0) {
      throw new Error("No ID returned from insert operation");
    }
    
    console.log(`✅ Event created with ID: ${result[0].id}`);
    return result[0].id;
  } catch (error) {
    console.error(`❌ Error adding event ${eventData.title}:`, error);
    throw error;
  }
} 