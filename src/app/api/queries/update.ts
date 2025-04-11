import { ParsedEvent } from "@/app/networkCalls/contentful/contentfulServices.types";
import { db } from "@/db";
import { eventsTable, ticketsTable, purchasesTable, purchaseItemsTable } from "@/db/schema";
import { eq, sql } from 'drizzle-orm';
import { UpdatedEventFields, UpdatedTicketFields } from "../api.types";

// Basic update operations
export async function updateEvent(eventId: number, updateData: Partial<UpdatedEventFields>) {
    return await db.update(eventsTable)
        .set(updateData)
        .where(eq(eventsTable.id, eventId));
}

export async function updateTicketById(ticketId: number, updateData: Partial<UpdatedTicketFields>) {
    return await db.update(ticketsTable)
        .set(updateData)
        .where(eq(ticketsTable.id, ticketId));
}

// Complex operations
export async function updateExistingEvents(events: ParsedEvent[]) {
    for (const event of events) {
        const existingEvent = await db.query.eventsTable.findFirst({
            where: sql`${eventsTable.contentfulId} = ${event.contentfulEventId}`
        });

        if (existingEvent) {
            const updatedFields: UpdatedEventFields = {};

            if (event?.title && existingEvent.title !== event.title) {
                updatedFields['title'] = event.title;
            }
            if (event?.date && existingEvent.date instanceof Date) {
                const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
                if (existingEvent.date.getTime() !== eventDate.getTime()) {
                    updatedFields['date'] = eventDate;
                }
            }

            if (Object.keys(updatedFields).length > 0) {
                await updateEvent(existingEvent.id, updatedFields);
            }

            // Update tickets
            for (const ticket of event.tickets) {
                const existingTicket = await db.query.ticketsTable.findFirst({
                    where: sql`${ticketsTable.contentfulId} = ${ticket.contentfulTicketId}`
                });

                if (existingTicket) {
                    const updatedTicketFields: UpdatedTicketFields = {};

                    // Prepare ticket time as Date object
                    const ticketTime = ticket.time instanceof Date ? ticket.time : new Date(ticket.time);
                    
                    // Compare dates safely
                    if (existingTicket.time instanceof Date && 
                        ticketTime instanceof Date && 
                        existingTicket.time.getTime() !== ticketTime.getTime()) {
                        updatedTicketFields['time'] = ticketTime;
                    }
                    
                    if (ticket?.ticketsAvailable && existingTicket.totalAvailable !== ticket.ticketsAvailable) {
                        updatedTicketFields['totalAvailable'] = ticket.ticketsAvailable;
                    }
                    if (ticket?.price !== undefined && existingTicket.price !== ticket.price) {
                        updatedTicketFields['price'] = ticket.price;
                    }

                    if (Object.keys(updatedTicketFields).length > 0) {
                        await updateTicketById(existingTicket.id, updatedTicketFields);
                    }
                } else {
                    // Insert new ticket if it doesn't exist
                    await db.insert(ticketsTable).values({
                        contentfulId: ticket.contentfulTicketId,
                        event: existingEvent.id,
                        totalAvailable: ticket.ticketsAvailable,
                        totalSold: 0,
                        time: ticket.time instanceof Date ? ticket.time : new Date(ticket.time)
                    });
                }
            }
        }
    }
}

export const refundOrder = async (orderId: number, quantity: number) => {
    // Fetch the purchase
    const purchase = await db.query.purchasesTable.findFirst({
        where: sql`${purchasesTable.id} = ${orderId}`
    });

    if (!purchase) {
        throw new Error('Purchase not found');
    }

    // Fetch related purchase items
    const purchaseItems = await db.query.purchaseItemsTable.findMany({
        where: sql`${purchaseItemsTable.purchaseId} = ${orderId}`
    });

    let totalRefunded = 0;

    for (const item of purchaseItems) {
        if (totalRefunded >= quantity) break;

        // Calculate refund amount for this item
        const refundableQty = Math.min(item.quantity, quantity - totalRefunded);

        // Adjust the quantity for partially refunded items
        await db.update(purchaseItemsTable)
            .set({
                updatedAt: new Date(),
                quantity: item.quantity - refundableQty // Decrease by refunded quantity
            })
            .where(sql`${purchaseItemsTable.id} = ${item.id}`);

        totalRefunded += refundableQty;

        // Update ticket sales count for each ticket item refunded
        await db.update(ticketsTable)
            .set({
                totalSold: sql`${ticketsTable.totalSold} - ${refundableQty}`
            })
            .where(sql`${ticketsTable.id} = ${item.ticketId}`);
    }

    // Finalize refund on the purchase record
    await db.update(purchasesTable)
        .set({
            updatedDate: new Date(),
            refundDate: new Date()
        })
        .where(sql`${purchasesTable.id} = ${orderId}`);

    return `Successfully refunded ${totalRefunded} items for order ID ${orderId}`;
};