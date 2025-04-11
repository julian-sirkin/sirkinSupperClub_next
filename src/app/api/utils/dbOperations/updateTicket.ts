import { db } from "@/db";
import { ticketsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Updates an existing ticket in the database
 */
export async function updateTicket(
  ticketId: number,
  ticketData: {
    time?: any;
    totalAvailable?: number;
  }
) {
  try {
    console.log(`✎ Updating ticket ID ${ticketId}`);
    
    // Build update data with only the fields that are provided
    const updateData: any = {};
    
    if (ticketData.totalAvailable !== undefined) {
      updateData.totalAvailable = ticketData.totalAvailable;
    }
    
    if (ticketData.time !== undefined) {
      // Ensure we use a Date object, not a timestamp
      updateData.time = ticketData.time instanceof Date ? 
        ticketData.time : new Date(ticketData.time);
    }
    
    // Only update if we have data to update
    if (Object.keys(updateData).length > 0) {
      // Update the ticket
      await db.update(ticketsTable)
        .set(updateData)
        .where(eq(ticketsTable.id, ticketId));
      
      console.log(`✅ Ticket ${ticketId} updated successfully`);
    } else {
      console.log(`⚠️ No changes to update for ticket ${ticketId}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error updating ticket ${ticketId}:`, error);
    throw error;
  }
} 