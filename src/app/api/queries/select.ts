import { db } from "@/db";
import { customersTable, eventsTable, SelectCustomer, ticketsTable, purchaseItemsTable, purchasesTable } from "@/db/schema";
import { CartTicketType } from "@/store/cartStore.types";
import { and, eq, isNull, SQL, sql } from "drizzle-orm";
import { adminEvent, adminEventDetails, DatabaseTickets } from "../api.types";

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
            name: eventsTable.title,
            date: eventsTable.date,
            ticketsAvailable: sql<number>`SUM(${ticketsTable.totalAvailable})`.as('ticketsAvailable'), // Sum of available tickets
            ticketsSold: sql<number>`SUM(${ticketsTable.totalSold})`.as('ticketsSold') // Sum of sold tickets
        })
        .from(eventsTable)
        .leftJoin(ticketsTable, eq(ticketsTable.event, eventsTable.id))
        .groupBy(eventsTable.id, eventsTable.title, eventsTable.date); // Ensure grouping by event fields

    return events.map(event => ({
        id: event.id,
        name: event.name,
        date: new Date((Number(event?.date) ?? 0)), // Convert timestamp to ISO string
        ticketsAvailable: event.ticketsAvailable || 0, // Default to 0 if no tickets
        ticketsSold: event.ticketsSold || 0 // Default to 0 if no tickets
    }));
}

export async function getEventTicketsWithPurchases(eventId: number): Promise<adminEventDetails[]> {
    const ticketsWithPurchases = await db
    .select({
        ticketId: ticketsTable.id,
        contentfulId: ticketsTable.contentfulId,
        totalAvailable: ticketsTable.totalAvailable,
        totalSold: ticketsTable.totalSold,
        purchaseId: sql<number>`${purchasesTable.id} as purchaseId`, // Aliased in `sql` template
        customerId: sql<number>`${purchasesTable.customerId} as customerId`,
        customerName: sql<string>`(SELECT name FROM customers WHERE id = ${purchasesTable.customerId}) as customerName`,
        quantity: sql<number>`${purchaseItemsTable.quantity} as quantity`,
        purchaseItemsId: sql<number>`${purchaseItemsTable.id} as purchaseItemsId`,
        purchaseDate: sql<number>`${purchasesTable.purchaseDate} as purchaseDate`,
    })
    .from(ticketsTable)
    .leftJoin(purchaseItemsTable, eq(purchaseItemsTable.ticketId, ticketsTable.id))
    .leftJoin(purchasesTable, eq(purchasesTable.id, purchaseItemsTable.purchaseId))
    .leftJoin(customersTable, eq(customersTable.id, purchasesTable.customerId)) // Join customersTable
    .where(eq(ticketsTable.event, eventId)); // Filter by event ID

    // Transform the result into the desired shape
    const result = ticketsWithPurchases.reduce((acc, ticket) => {
        const { ticketId, contentfulId, totalAvailable, totalSold, purchaseId, customerId, customerName, quantity, purchaseItemsId, purchaseDate } = ticket;

        // Find or create the ticket entry in the accumulator
        let ticketEntry = acc.find(t => t.ticketId === ticketId);
        if (!ticketEntry) {
            ticketEntry = {
                ticketId,
                contentfulId,
                totalAvailable,
                totalSold,
                purchases: []
            };
            acc.push(ticketEntry);
        }

        // If there's a purchase, add it to the ticket entry
        if (purchaseId) {
            ticketEntry.purchases.push({
                purchaseId,
                customerId,
                customerName,
                quantity,
                purchaseItemsId,
                purchaseDate
            });
        }
        return acc;
    }, [] as any[]); // Initialize as an empty array

    return result;
}