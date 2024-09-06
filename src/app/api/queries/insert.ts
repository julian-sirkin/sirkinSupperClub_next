import { ParsedEvent } from "@/app/contentful/contentfulServices.types";
import { db } from "@/db";
import { customersTable, eventsTable, InsertCustomer, InsertEvent, InsertPurchase, InsertPurchaseItem, InsertTicket, purchaseItemsTable, purchasesTable, ticketsTable } from "@/db/schema";
import { sql } from 'drizzle-orm';
import { PurchasedTickets } from "../api.types";
import { CartTicketType } from "@/store/cartStore.types";

export async function createCustomer(data: InsertCustomer) {
    return await db.insert(customersTable).values(data).returning({id: customersTable.id})
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
            contentfulId: currentEvent.contentfulEventId,
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
                contentfulId: ticket.contentfulTicketId,
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


export async function createTicketPurchase(purchasedTickets: CartTicketType[], customerId: number, paid: boolean) {
    try {
    // Start a transaction to ensure atomicity
    await db.transaction(async (trx) => {
        const purchaseTicketsResults = {isSuccesful: true, successfulPurchases: [], failedPurchases: []}

        // Create a new purchase entry
        const purchase: InsertPurchase = {
            customerId: customerId,
            paid: paid,
            purchaseDate: new Date(Math.floor(Date.now() / 1000)), // Current timestamp in seconds
            updatedDate: new Date(Math.floor(Date.now() / 1000)),
            refundDate: null // Assuming no refund initially
        };

        const [{purchaseId}] = await trx.insert(purchasesTable).values(purchase).returning({purchaseId: purchasesTable.id});

        // Loop through each purchased ticket to handle ticket inventory and purchase items
        for (const purchasedTicket of purchasedTickets) {
            // Fetch the ticket to verify inventory
            const tickets = await trx.select().from(ticketsTable)
                .where(sql`${ticketsTable.contentfulId} = ${purchasedTicket.contentfulTicketId}`)

            const ticket = tickets.length > 0 ? tickets[0] : null

            if (!ticket) {
                throw new Error(`Ticket with Contentful ID ${purchasedTicket.contentfulTicketId} not found`);
            }

            if (ticket.totalAvailable - ticket.totalSold < purchasedTicket.quantity) {
                throw new Error(`Not enough tickets available for Contentful ID ${purchasedTicket.contentfulTicketId}`);
            }

            // Update the ticket inventory
            await trx.update(ticketsTable)
                .set({
                    totalSold: sql`${ticketsTable.totalSold} + ${purchasedTicket.quantity}`
                })
                .where(sql`${ticketsTable.id} = ${ticket.id}`);

            // Create a purchase item entry
            const purchaseItem: InsertPurchaseItem = {
                purchaseId,
                ticketId: ticket.id,
                quantity: purchasedTicket.quantity,
                createdAt: new Date(Math.floor(Date.now() / 1000)),
                updatedAt: new Date(Math.floor(Date.now() / 1000))
            };

            await trx.insert(purchaseItemsTable).values(purchaseItem)
        }
    });

    return {
        isSuccessful: true,
        message: 'Purchase created Successfully'
    }
} catch (error){
    if (error instanceof Error) {
        return {
            isSuccessful: false,
            message: `Error creating purchase: ${error.message}`
        }
    } else {
        return {
            isSuccessful: false,
            message: 'Failed to complete transaction'
        }
    }

}

}