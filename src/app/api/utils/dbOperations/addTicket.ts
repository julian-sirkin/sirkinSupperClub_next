import { createSingleTicket } from "@/app/api/queries/insert";

/**
 * Adds a new ticket to the database
 */
export async function addTicket(ticketData: {
  contentfulId: string;
  event: number; // Foreign key to event
  time: any; // Could be Date, string, etc.
  totalAvailable: number;
  totalSold?: number;
}) {
  try {
    console.log(`➕ Adding new ticket: ${ticketData.contentfulId}`);
    
    // Ensure we insert a Date object, not a timestamp
    const ticketToInsert = {
      contentfulId: ticketData.contentfulId,
      event: ticketData.event,
      time: ticketData.time instanceof Date ? ticketData.time : new Date(ticketData.time),
      totalAvailable: ticketData.totalAvailable,
      totalSold: ticketData.totalSold || 0
    };
    
    // Use the dedicated query function
    await createSingleTicket(ticketToInsert);
    console.log(`✅ Ticket created successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error adding ticket:`, error);
    throw error;
  }
} 