import { ParsedEvent } from "@/app/networkCalls/contentful/contentfulServices.types";
import { db } from "@/db";
import { eventsTable, ticketsTable, purchasesTable, purchaseItemsTable } from "@/db/schema";
import { sql } from 'drizzle-orm';
import { UpdatedEventFields, UpdatedTicketFields } from "../api.types";

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
            if (event?.date && existingEvent.date !== event.date) {
                updatedFields['date'] = event.date;
            }
            // Add other fields as necessary

            if (Object.keys(updatedFields).length > 0) {
                await db.update(eventsTable)
                    .set(updatedFields)
                    .where(sql`${eventsTable.contentfulId} = ${event.contentfulEventId}`);
            }

            // Update tickets
            for (const ticket of event.tickets) {
                const existingTicket = await db.query.ticketsTable.findFirst({
                    where: sql`${ticketsTable.contentfulId} = ${ticket.contentfulTicketId}`
                });

                if (existingTicket) {
                    const updatedTicketFields: UpdatedTicketFields = {};

                    if (ticket?.time && existingTicket.time !== ticket.time) {
                        updatedTicketFields['time'] = new Date(ticket.time);
                    }
                    if (ticket?.ticketsAvailable && existingTicket.totalAvailable !== ticket.ticketsAvailable) {
                        updatedTicketFields['totalAvailable'] = ticket.ticketsAvailable;
                    }
                    if (ticket?.price !== undefined && existingTicket.price !== ticket.price) {
                        updatedTicketFields['price'] = ticket.price;
                    }

                    if (Object.keys(updatedTicketFields).length > 0) {
                        await db.update(ticketsTable)
                            .set(updatedTicketFields)
                            .where(sql`${ticketsTable.contentfulId} = ${ticket.contentfulTicketId}`);
                    }
                } else {
                    // Insert new ticket if it doesn't exist
                    await db.insert(ticketsTable).values({
                        contentfulId: ticket.contentfulTicketId,
                        event: existingEvent.id,  // Associate this ticket with the correct event
                        totalAvailable: ticket.ticketsAvailable,
                        totalSold: 0,  // Assuming tickets start with 0 sold
                        time: ticket.time
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