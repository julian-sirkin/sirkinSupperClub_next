import { db } from "@/db";
import { customersTable, eventsTable, SelectCustomer, ticketsTable } from "@/db/schema";
import { CartTicketType } from "@/store/cartStore.types";
import { and, eq, isNull, sql } from "drizzle-orm";
import { adminEvent, DatabaseTickets } from "../api.types";

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