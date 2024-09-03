import { ParsedEvent } from "@/app/contentful/contentfulServices.types";
import { db } from "@/db";
import { customersTable, eventsTable, InsertCustomer, InsertEvent, InsertTicket, ticketsTable } from "@/db/schema";


export async function createCustomer(data: InsertCustomer) {
    return await db.insert(customersTable).values(data)
}

export async function createEvent(data: InsertEvent[]) {
   return await db.insert(eventsTable).values(data).returning({id: eventsTable.id})
}

export async function createTicket(data: InsertTicket[]) {
   return await db.insert(ticketsTable).values(data)
}

export async function createEventWithTickets(parsedEvents: ParsedEvent[]) {
    
    /**
     * Reshape and add Event to database
     */
    const eventsToInsert: InsertEvent[] = parsedEvents.map(currentEvent => {
        return {
            title: currentEvent.title,
            contentfulId: currentEvent.contentfulId,
            date: currentEvent.date
        }
    })

    const insertedEvents = await createEvent(eventsToInsert)

    /** Reshape Tickets for insertion with a key to the event already added */
    const ticketsToInsert: InsertTicket[] = []
    insertedEvents.forEach((insertedEvent, index) => {
        const parsedEvent = parsedEvents[index];
        parsedEvent.tickets.forEach((ticket) => {
            
            ticketsToInsert.push({
                contentfulId: ticket.contentfulId,
                event: insertedEvent.id,  // Associate this ticket with the correct event
                totalAvailable: ticket.ticketsAvailable,
                totalSold: 0,  // Assuming tickets start with 0 sold
                time: ticket.time
            });
        });
    });

    /**
     * Put tickets into database
     */
    createTicket(ticketsToInsert)
}