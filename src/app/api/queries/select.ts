import { db } from "@/db";
import { customersTable, eventsTable, SelectCustomer, ticketsTable } from "@/db/schema";
import { eq, and} from "drizzle-orm";
import { GetTicketByIdAndEventProps, PurchasedTickets } from "../api.types";

export async function getCustomerByEmail(email: SelectCustomer['email']){
return db.select().from(customersTable).where(eq(customersTable.email, email));
}



export async function getTicketsByIdAndEvent(
    ticketEventProps: GetTicketByIdAndEventProps[]
) {
    const tickets = await Promise.all(
        ticketEventProps.map(({ ticketContentfulId, eventContentfulId }) =>
            db
                .select({
                    ticket: ticketsTable,
                    event: eventsTable,
                })
                .from(ticketsTable)
                .innerJoin(eventsTable, eq(ticketsTable.event, eventsTable.id))
                .where(
                    and(
                        eq(ticketsTable.contentfulId, ticketContentfulId),
                        eq(eventsTable.contentfulId, eventContentfulId)
                    )
                )
        )
    );

    return tickets.flat(); // Flatten the array of results if necessary
}