import { ParsedEvent } from "@/app/networkCalls/contentful/contentfulServices.types";
import { db } from "@/db";
import { addonsTable, customersTable, eventsTable, InsertAddon, InsertCustomer, InsertEvent, InsertPurchase, InsertPurchaseItem, InsertPurchaseItemAddon, InsertTicket, purchaseItemAddonsTable, purchaseItemsTable, purchasesTable, ticketAddonsTable, ticketsTable } from "@/db/schema";
import { and, eq, sql } from 'drizzle-orm';
import { CartTicketType } from "@/store/cartStore.types";

// Basic database operations
export async function createCustomer(data: InsertCustomer) {
    return await db.insert(customersTable).values(data).returning({id: customersTable.id});
}

export async function createEvent(data: InsertEvent[]) {
    return await db.insert(eventsTable).values(data).returning({id: eventsTable.id});
}

export async function createSingleEvent(data: InsertEvent) {
    return await db.insert(eventsTable).values(data).returning({id: eventsTable.id});
}

export async function createTicket(data: InsertTicket[]) {
    return await db.insert(ticketsTable).values(data);
}

export async function createSingleTicket(data: InsertTicket) {
    return await db.insert(ticketsTable).values(data).returning({id: ticketsTable.id});
}

export async function upsertAddonByContentfulId(data: InsertAddon) {
    const existingAddon = await db
        .select()
        .from(addonsTable)
        .where(eq(addonsTable.contentfulId, data.contentfulId));

    if (existingAddon.length > 0) {
        const addon = existingAddon[0];
        await db
            .update(addonsTable)
            .set({
                title: data.title,
                price: data.price,
            })
            .where(eq(addonsTable.id, addon.id));

        return addon.id;
    }

    const [insertedAddon] = await db
        .insert(addonsTable)
        .values(data)
        .returning({id: addonsTable.id});

    return insertedAddon.id;
}

export async function linkTicketAddon(ticketId: number, addonId: number) {
    const existingLink = await db
        .select()
        .from(ticketAddonsTable)
        .where(and(eq(ticketAddonsTable.ticketId, ticketId), eq(ticketAddonsTable.addonId, addonId)));

    if (existingLink.length === 0) {
        await db.insert(ticketAddonsTable).values({ ticketId, addonId });
    }
}

export async function removeTicketAddonLinks(ticketId: number, addonIdsToKeep: number[]) {
    const currentLinks = await db
        .select()
        .from(ticketAddonsTable)
        .where(eq(ticketAddonsTable.ticketId, ticketId));

    const addonIdsSet = new Set(addonIdsToKeep);
    const linksToDelete = currentLinks.filter(link => !addonIdsSet.has(link.addonId));

    for (const link of linksToDelete) {
        await db.delete(ticketAddonsTable).where(eq(ticketAddonsTable.id, link.id));
    }
}

// Complex operations
export async function createEventWithTickets(parsedEvents: ParsedEvent[]) {
    /**
     * Reshape and add Event to database
     */
    const eventsToInsert: InsertEvent[] = parsedEvents.map(currentEvent => {
        return {
            title: currentEvent.title,
            contentfulId: currentEvent.contentfulEventId,
            date: currentEvent.date instanceof Date ? currentEvent.date : new Date(currentEvent.date)
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
                time: ticket.time instanceof Date ? ticket.time : new Date(ticket.time)
            });
        });
    });

    /**
     * Put tickets into database
     */
    await createTicket(ticketsToInsert);
}

export async function createTicketPurchase(purchasedTickets: CartTicketType[], customerId: number, paid: boolean) {
    try {
        // Start a transaction to ensure atomicity
        await db.transaction(async (trx) => {
            // Create a new purchase entry
            const purchase: InsertPurchase = {
                customerId: customerId,
                paid: paid,
                purchaseDate: new Date(), // Use native Date object
                updatedDate: new Date(),
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
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const [{purchaseItemId}] = await trx
                    .insert(purchaseItemsTable)
                    .values(purchaseItem)
                    .returning({purchaseItemId: purchaseItemsTable.id});

                const addonQuantity = Number(purchasedTicket.addonQuantity ?? 0);
                const selectedAddonContentfulId = purchasedTicket.selectedAddonContentfulId ?? null;

                if (addonQuantity > 0) {
                    if (!selectedAddonContentfulId) {
                        throw new Error(`Addon quantity provided without addon id for ticket ${purchasedTicket.contentfulTicketId}`);
                    }

                    if (addonQuantity > purchasedTicket.quantity) {
                        throw new Error(`Addon quantity cannot exceed ticket quantity for ${purchasedTicket.contentfulTicketId}`);
                    }

                    const addons = await trx
                        .select()
                        .from(addonsTable)
                        .where(eq(addonsTable.contentfulId, selectedAddonContentfulId));

                    const addon = addons.length > 0 ? addons[0] : null;

                    if (!addon) {
                        throw new Error(`Addon ${selectedAddonContentfulId} not found`);
                    }

                    const ticketAddonLink = await trx
                        .select()
                        .from(ticketAddonsTable)
                        .where(and(
                            eq(ticketAddonsTable.ticketId, ticket.id),
                            eq(ticketAddonsTable.addonId, addon.id),
                        ));

                    if (ticketAddonLink.length === 0) {
                        throw new Error(`Addon ${selectedAddonContentfulId} is not linked to ticket ${purchasedTicket.contentfulTicketId}`);
                    }

                    const purchaseItemAddon: InsertPurchaseItemAddon = {
                        purchaseItemId,
                        addonId: addon.id,
                        quantity: addonQuantity,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };

                    await trx.insert(purchaseItemAddonsTable).values(purchaseItemAddon);
                }
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