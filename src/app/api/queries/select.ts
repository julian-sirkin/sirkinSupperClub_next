import { db } from "@/db";
import { customersTable, eventsTable, SelectCustomer, ticketsTable, purchaseItemsTable, purchasesTable } from "@/db/schema";
import { CartTicketType } from "@/store/cartStore.types";
import { and, eq, isNull, SQL, sql } from "drizzle-orm";
import { adminEvent, DatabaseTickets, TicketWithPurchases } from "../api.types";
import { AdminEvent } from '@/types';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';

// Type the database properly
const typedDb = db as LibSQLDatabase<typeof import('@/db/schema')>;

export async function getCustomerByEmail(email: SelectCustomer['email']){
return typedDb.select().from(customersTable).where(eq(customersTable.email, email));
}



export async function getTicketsByIdAndEvent(
    ticketEventProps: Array<Pick<CartTicketType, 'contentfulTicketId' | 'eventContentfulId'>>
): Promise <DatabaseTickets[]> {
    const tickets = await Promise.all(
        ticketEventProps.map(({ contentfulTicketId, eventContentfulId }) =>
            typedDb
                .select({
                    ticket: ticketsTable,
                })
                .from(ticketsTable)
                .leftJoin(eventsTable, eq(ticketsTable.event, eventsTable.id))
                .where(
                    and(
                        eq(ticketsTable.contentfulId, contentfulTicketId),
                        eq(eventsTable.contentfulId, eventContentfulId)
                    )
                )
        )
    );

    return tickets.flat();
}




export async function getAllAdminEvents(): Promise<adminEvent[]> {
    // Get all events first
    const allEvents = await typedDb.select().from(eventsTable);
    
    // For each event, get ticket counts separately to avoid join issues
    const eventsWithCounts = await Promise.all(
        allEvents.map(async (event) => {
            const ticketCounts = await typedDb
                .select({
                    totalAvailable: sql<number>`COALESCE(SUM(${ticketsTable.totalAvailable}), 0)`,
                    totalSold: sql<number>`COALESCE(SUM(${ticketsTable.totalSold}), 0)`
                })
                .from(ticketsTable)
                .where(eq(ticketsTable.event, event.id));
            
            const counts = ticketCounts[0] || { totalAvailable: 0, totalSold: 0 };
            
            return {
                id: event.id,
                title: event.title,
                date: Number(event.date ?? 0),
                ticketsAvailable: counts.totalAvailable,
                ticketsSold: counts.totalSold
            };
        })
    );
    
    // Sort by date
    return eventsWithCounts.sort((a, b) => a.date - b.date);
}

// export async function getEventTicketsWithPurchases(eventId: number) {
//   try {
//     // First, get the event details
//     const eventDetails = await db
//       .select({
//         id: eventsTable.id,
//         title: eventsTable.title,
//         date: eventsTable.date
//       })
//       .from(eventsTable)
//       .where(eq(eventsTable.id, eventId));

//     if (eventDetails.length === 0) {
//       throw new Error("Event not found");
//     }

//     // Get all tickets for this event
//     const tickets = await db
//       .select()
//       .from(ticketsTable)
//       .where(eq(ticketsTable.event, eventId));

//     if (!tickets || tickets.length === 0) {
//       // Return event with empty tickets array
//       return {
//         id: eventDetails[0].id,
//         title: eventDetails[0].title,
//         date: eventDetails[0].date,
//         tickets: []
//       };
//     }

//     // Get all ticket purchases at once with proper joins
//     const ticketPurchases = await db
//       .select({
//         purchaseId: purchasesTable.id,
//         ticketId: ticketsTable.id,
//         ticketTime: ticketsTable.time,
//         customerId: customersTable.id,
//         customerName: customersTable.name,
//         customerEmail: customersTable.email,
//         quantity: purchaseItemsTable.quantity,
//         paid: purchasesTable.paid,
//         purchaseDate: purchasesTable.purchaseDate,
//         dietaryRestrictions: customersTable.dietaryRestrictions,
//         notes: customersTable.notes
//       })
//       .from(ticketsTable)
//       .innerJoin(purchaseItemsTable, eq(purchaseItemsTable.ticketId, ticketsTable.id))
//       .innerJoin(purchasesTable, eq(purchaseItemsTable.purchaseId, purchasesTable.id))
//       .innerJoin(customersTable, eq(purchasesTable.customerId, customersTable.id))
//       .where(eq(ticketsTable.event, eventId));

//     // Group purchases by ticketId
//     const ticketData = tickets.map((ticket) => {
//       const purchases = ticketPurchases
//         .filter((p) => p.ticketId === ticket.id)
//         .map((p) => ({
//           purchaseId: p.purchaseId,
//           customerId: p.customerId,
//           customerName: p.customerName,
//           customerEmail: p.customerEmail,
//           quantity: p.quantity,
//           paid: p.paid,
//           purchaseDate: p.purchaseDate,
//           ticketId: p.ticketId,
//           dietaryRestrictions: p.dietaryRestrictions,
//           notes: p.notes
//         }));

//       return {
//         ticketId: ticket.id,
//         ticketTime: ticket.time,
//         totalAvailable: ticket.totalAvailable,
//         totalSold: ticket.totalSold,
//         purchases
//       };
//     });

//     // Return the event with its tickets and purchases
//     return {
//       id: eventDetails[0].id,
//       title: eventDetails[0].title,
//       date: eventDetails[0].date,
//       tickets: ticketData
//     };
//   } catch (error) {
//     console.error("Error fetching event with tickets and purchases:", error);
//     throw error;
//   }
// }

export async function getEventTicketsWithPurchases(eventId: number) {
  try {
    // Fetch event details
    const event = await typedDb
      .select({
        id: eventsTable.id,
        title: eventsTable.title,
        date: eventsTable.date,
      })
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .then((res: any) => res[0] || null);

    if (!event) {
      console.error(`Event not found for event ID: ${eventId}`);
      return null;
    }

    // Fetch tickets for this event
    const tickets = await typedDb
      .select({
        ticketId: ticketsTable.id,
        ticketTime: ticketsTable.time,
        totalAvailable: ticketsTable.totalAvailable,
        totalSold: ticketsTable.totalSold,
      })
      .from(ticketsTable)
      .where(eq(ticketsTable.event, eventId));

    // Process each ticket one by one
    const ticketsWithPurchases = [];
    
    for (const ticket of tickets) {
      try {
        // Get purchase items for this ticket
        const purchaseItems = await typedDb
          .select()
          .from(purchaseItemsTable)
          .where(eq(purchaseItemsTable.ticketId, ticket.ticketId));
        
        // Process purchase items
        const purchases = [];
        
        for (const item of purchaseItems) {
          try {
            // Get purchase details
            const purchaseResult = await typedDb
              .select()
              .from(purchasesTable)
              .where(eq(purchasesTable.id, item.purchaseId));
            
            if (!purchaseResult || purchaseResult.length === 0) continue;
            
            const purchase = purchaseResult[0];
            
            // Get customer details
            const customerResult = await typedDb
              .select()
              .from(customersTable)
              .where(eq(customersTable.id, purchase.customerId));
            
            if (!customerResult || customerResult.length === 0) continue;
            
            const customer = customerResult[0];
            
            // Add to purchases array
            purchases.push({
              purchaseId: purchase.id,
              purchaseItemsId: item.id,
              customerId: customer.id,
              customerName: customer.name,
              customerEmail: customer.email,
              quantity: item.quantity,
              paid: purchase.paid,
              purchaseDate: purchase.purchaseDate,
              ticketId: ticket.ticketId,
              notes: customer.notes,
            });
          } catch (itemError) {
            console.error(`Error processing purchase item ${item.id}:`, itemError);
            // Continue with next item
          }
        }
        
        // Add ticket with its purchases
        ticketsWithPurchases.push({
          ...ticket,
          purchases,
        });
      } catch (ticketError) {
        console.error(`Error processing ticket ${ticket.ticketId}:`, ticketError);
        // Continue with next ticket
      }
    }

    return { 
      ...event, 
      tickets: ticketsWithPurchases 
    };
  } catch (error) {
    console.error("🚨 Error in getEventTicketsWithPurchases:", error);
    return {
      id: eventId,
      title: "Error loading event",
      date: new Date(),
      tickets: []
    };
  }
}

export async function findEventByContentfulId(contentfulId: string) {
  return await typedDb
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.contentfulId, contentfulId));
}

export async function findTicketByContentfulId(contentfulId: string) {
  return await typedDb
    .select()
    .from(ticketsTable)
    .where(eq(ticketsTable.contentfulId, contentfulId));
}
