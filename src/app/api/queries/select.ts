import { db } from "@/db";
import { customersTable, eventsTable, SelectCustomer, ticketsTable, purchaseItemsTable, purchasesTable } from "@/db/schema";
import { CartTicketType } from "@/store/cartStore.types";
import { and, eq, isNull, SQL, sql } from "drizzle-orm";
import { adminEvent, DatabaseTickets, TicketWithPurchases } from "../api.types";

export async function getCustomerByEmail(email: SelectCustomer['email']){
return db.select().from(customersTable).where(eq(customersTable.email, email));
}



export async function getTicketsByIdAndEvent(
    ticketEventProps: Array<Pick<CartTicketType, 'contentfulTicketId' | 'eventContentfulId'>>
): Promise <DatabaseTickets[]> {
    const tickets = await Promise.all(
        ticketEventProps.map(({ contentfulTicketId, eventContentfulId }) =>
            db
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

    return tickets.flat(); // Flatten the array of results if necessary
}




export async function getAllAdminEvents(): Promise<adminEvent[]> {
    const events = await db
        .select({
            id: eventsTable.id,
            title: eventsTable.title,
            date: eventsTable.date,
            ticketsAvailable: sql<number>`SUM(${ticketsTable.totalAvailable})`.as('ticketsAvailable'),
            ticketsSold: sql<number>`SUM(${ticketsTable.totalSold})`.as('ticketsSold')
        })
        .from(eventsTable)
        .leftJoin(ticketsTable, eq(ticketsTable.event, eventsTable.id))
        .groupBy(eventsTable.id, eventsTable.title, eventsTable.date);

    return events.map(event => ({
        id: event.id,
        title: event.title,
        date: Number(event?.date ?? 0),
        ticketsAvailable: event.ticketsAvailable || 0,
        ticketsSold: event.ticketsSold || 0
    }));
}

export async function getEventTicketsWithPurchases(eventId: number) {
  try {
    // First, get the event details
    const eventDetails = await db
      .select({
        id: eventsTable.id,
        title: eventsTable.title,
        date: eventsTable.date
      })
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId));

    if (eventDetails.length === 0) {
      throw new Error("Event not found");
    }

    // Get all tickets for this event
    const tickets = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.event, eventId));

    if (!tickets || tickets.length === 0) {
      // Return event with empty tickets array
      return {
        id: eventDetails[0].id,
        title: eventDetails[0].title,
        date: eventDetails[0].date,
        tickets: []
      };
    }

    // Get all ticket purchases at once with proper joins
    const ticketPurchases = await db
      .select({
        ticketId: ticketsTable.id,
        ticketTime: ticketsTable.time,
        totalAvailable: ticketsTable.totalAvailable,
        totalSold: ticketsTable.totalSold,
        purchaseId: purchasesTable.id,
        customerId: customersTable.id,
        customerName: customersTable.name,
        customerEmail: customersTable.email,
        quantity: purchaseItemsTable.quantity,
        paid: purchasesTable.paid,
        purchaseDate: purchasesTable.purchaseDate
      })
      .from(ticketsTable)
      .innerJoin(purchaseItemsTable, eq(purchaseItemsTable.ticketId, ticketsTable.id))
      .innerJoin(purchasesTable, eq(purchaseItemsTable.purchaseId, purchasesTable.id))
      .innerJoin(customersTable, eq(purchasesTable.customerId, customersTable.id))
      .where(eq(ticketsTable.event, eventId));

    // Group purchases by ticketId
    const ticketData = tickets.map((ticket) => {
      const purchases = ticketPurchases
        .filter((p) => p.ticketId === ticket.id)
        .map((p) => ({
          purchaseId: p.purchaseId,
          customerId: p.customerId,
          customerName: p.customerName,
          customerEmail: p.customerEmail,
          quantity: p.quantity,
          paid: p.paid,
          purchaseDate: p.purchaseDate,
          ticketId: p.ticketId
        }));

      return {
        ticketId: ticket.id,
        ticketTime: ticket.time,
        totalAvailable: ticket.totalAvailable,
        totalSold: ticket.totalSold,
        purchases
      };
    });

    // Return the event with its tickets and purchases
    return {
      id: eventDetails[0].id,
      title: eventDetails[0].title,
      date: eventDetails[0].date,
      tickets: ticketData
    };
  } catch (error) {
    console.error("Error fetching event with tickets and purchases:", error);
    throw error;
  }
}