import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { purchaseItemsTable, purchasesTable, ticketsTable } from "@/db/schema";
import { validateGuestMove } from "@/app/utils/validateGuestMove";
import { isAdminRequest, unauthorizedAdminResponse } from "../utils/isAdminRequest";

class GuestMoveError extends Error {}

const toSlot = (ticket?: typeof ticketsTable.$inferSelect) =>
    ticket && {
        id: ticket.id,
        eventId: ticket.event,
        totalAvailable: ticket.totalAvailable,
        totalSold: ticket.totalSold,
    };

export async function POST(request: Request) {
    if (!(await isAdminRequest(request))) {
        return unauthorizedAdminResponse();
    }

    try {
        const { purchaseItemId, targetTicketId } = await request.json();

        if (!purchaseItemId || !targetTicketId) {
            return NextResponse.json({ message: "Missing purchaseItemId or targetTicketId" }, { status: 400 });
        }

        const result = await db.transaction(async (tx) => {
            const item = await tx
                .select()
                .from(purchaseItemsTable)
                .where(eq(purchaseItemsTable.id, purchaseItemId))
                .then((rows) => rows[0]);

            if (!item) {
                throw new GuestMoveError("Purchase item not found");
            }

            const [sourceTicket, targetTicket] = await Promise.all([
                tx.select().from(ticketsTable).where(eq(ticketsTable.id, item.ticketId)).then((rows) => rows[0]),
                tx.select().from(ticketsTable).where(eq(ticketsTable.id, targetTicketId)).then((rows) => rows[0]),
            ]);

            const existingTargetItem = await tx
                .select({ id: purchaseItemsTable.id })
                .from(purchaseItemsTable)
                .where(and(
                    eq(purchaseItemsTable.purchaseId, item.purchaseId),
                    eq(purchaseItemsTable.ticketId, targetTicketId),
                ))
                .then((rows) => rows[0]);

            const validationError = validateGuestMove({
                quantity: item.quantity,
                sourceSlot: toSlot(sourceTicket),
                targetSlot: toSlot(targetTicket),
                orderAlreadyInTarget: !!existingTargetItem,
            });

            if (validationError) {
                throw new GuestMoveError(validationError);
            }

            await tx.update(purchaseItemsTable)
                .set({ ticketId: targetTicketId, updatedAt: new Date() })
                .where(eq(purchaseItemsTable.id, item.id));

            await tx.update(ticketsTable)
                .set({ totalSold: sql`${ticketsTable.totalSold} - ${item.quantity}` })
                .where(eq(ticketsTable.id, item.ticketId));

            await tx.update(ticketsTable)
                .set({ totalSold: sql`${ticketsTable.totalSold} + ${item.quantity}` })
                .where(eq(ticketsTable.id, targetTicketId));

            await tx.update(purchasesTable)
                .set({ updatedDate: new Date() })
                .where(eq(purchasesTable.id, item.purchaseId));

            return { purchaseItemId: item.id, fromTicketId: item.ticketId, toTicketId: targetTicketId, quantity: item.quantity };
        });

        return NextResponse.json({ message: "Success: guest moved", data: result }, { status: 200 });
    } catch (error) {
        if (error instanceof GuestMoveError) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        console.error("Error moving guest:", error);
        return NextResponse.json({
            message: "Server error while moving guest",
            error: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}
