import { db } from "@/db";
import { customersTable, eventsTable, SelectCustomer, ticketsTable } from "@/db/schema";
import { CartTicketType } from "@/store/cartStore.types";
import { and, eq } from "drizzle-orm";
import { DatabaseTickets } from "../api.types";

export async function getCustomerByEmail(email: SelectCustomer['email']){
return db.select().from(customersTable).where(eq(customersTable.email, email));
}



export async function getTicketsByIdAndEvent(
    ticketEventProps: CartTicketType[]
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