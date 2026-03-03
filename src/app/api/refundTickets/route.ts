import { NextResponse } from "next/server";
import { db } from "@/db";
import { purchasesTable, purchaseItemAddonsTable, purchaseItemsTable, ticketsTable } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        console.log("🚀 Refund Request Data:", data);

        const { orderId, ticketId, quantity, target, purchaseItemId, addonId } = data;
        const refundTarget: "ticket" | "addon" = target === "addon" ? "addon" : "ticket";

        if (!orderId || !ticketId || !quantity || quantity <= 0) {
            console.error("❌ Invalid refund request:", { orderId, ticketId, quantity, refundTarget });
            return NextResponse.json({ 
                success: false, 
                message: "Invalid orderId, ticketId, or quantity" 
            }, { status: 400 });
        }

        if (refundTarget === "addon") {
            if (!purchaseItemId || !addonId) {
                return NextResponse.json({
                    success: false,
                    message: "Addon refunds require purchaseItemId and addonId",
                }, { status: 400 });
            }

            const matchingPurchaseItem = await db
                .select({
                    id: purchaseItemsTable.id,
                })
                .from(purchaseItemsTable)
                .where(and(
                    eq(purchaseItemsTable.id, purchaseItemId),
                    eq(purchaseItemsTable.purchaseId, orderId),
                    eq(purchaseItemsTable.ticketId, ticketId),
                ))
                .then(res => res[0]);

            if (!matchingPurchaseItem) {
                return NextResponse.json({
                    success: false,
                    message: "Purchase item not found for addon refund",
                }, { status: 404 });
            }

            const addonLine = await db
                .select({
                    id: purchaseItemAddonsTable.id,
                    quantity: purchaseItemAddonsTable.quantity,
                })
                .from(purchaseItemAddonsTable)
                .where(and(
                    eq(purchaseItemAddonsTable.purchaseItemId, purchaseItemId),
                    eq(purchaseItemAddonsTable.addonId, addonId),
                ))
                .then(res => res[0]);

            if (!addonLine) {
                return NextResponse.json({
                    success: false,
                    message: "Addon line not found for this order",
                }, { status: 404 });
            }

            if (quantity > addonLine.quantity) {
                return NextResponse.json({
                    success: false,
                    message: "Refund quantity exceeds purchased addon quantity",
                }, { status: 400 });
            }

            await db.transaction(async (tx) => {
                if (quantity === addonLine.quantity) {
                    await tx.delete(purchaseItemAddonsTable).where(eq(purchaseItemAddonsTable.id, addonLine.id));
                } else {
                    await tx.update(purchaseItemAddonsTable)
                        .set({
                            quantity: addonLine.quantity - quantity,
                            updatedAt: new Date(),
                        })
                        .where(eq(purchaseItemAddonsTable.id, addonLine.id));
                }

                await tx.update(purchasesTable)
                    .set({ updatedDate: new Date() })
                    .where(eq(purchasesTable.id, orderId));
            });

            const remainingAddonQuantity = await db
                .select({
                    quantity: sql<number>`COALESCE(SUM(${purchaseItemAddonsTable.quantity}), 0)`,
                })
                .from(purchaseItemAddonsTable)
                .where(eq(purchaseItemAddonsTable.purchaseItemId, purchaseItemId))
                .then(res => Number(res[0]?.quantity ?? 0));

            return NextResponse.json({
                success: true,
                message: "Addon refund processed successfully",
                data: {
                    target: "addon",
                    refundedAddonQuantity: quantity,
                    remainingAddonQuantity,
                    purchaseId: orderId,
                    purchaseItemId,
                },
            }, { status: 200 });
        }

        // Fetch the specific purchase item
        const purchaseItem = await db
            .select({
                id: purchaseItemsTable.id,
                purchaseId: purchaseItemsTable.purchaseId,
                ticketId: purchaseItemsTable.ticketId,
                purchaseQuantity: purchaseItemsTable.quantity
            })
            .from(purchaseItemsTable)
            .where(and(eq(purchaseItemsTable.purchaseId, orderId), eq(purchaseItemsTable.ticketId, ticketId)))
            .then(res => res[0]); // Ensure we get a single object

        console.log("✅ Fetched Purchase Item:", purchaseItem);

        if (!purchaseItem) {
            return NextResponse.json({ 
                success: false, 
                message: "Purchase item not found for this ticket" 
            }, { status: 404 });
        }

        const { id, purchaseQuantity } = purchaseItem;

        // Ensure refund quantity is valid
        if (quantity > purchaseQuantity) {
            console.error("❌ Refund quantity exceeds available tickets");
            return NextResponse.json({ 
                success: false, 
                message: "Refund quantity exceeds available tickets" 
            }, { status: 400 });
        }

        let autoRefundedAddonQuantity = 0;
        const newTicketQuantity = Math.max(0, purchaseQuantity - quantity);

        await db.transaction(async (tx) => {
            console.log("🔄 Starting database transaction...");

            // Delete if refunding all tickets
            if (quantity === purchaseQuantity) {
                console.log("🗑️ Deleting purchase item ID:", id);

                const addonRows = await tx
                    .select({
                        id: purchaseItemAddonsTable.id,
                        quantity: purchaseItemAddonsTable.quantity,
                    })
                    .from(purchaseItemAddonsTable)
                    .where(eq(purchaseItemAddonsTable.purchaseItemId, id));

                autoRefundedAddonQuantity = addonRows.reduce(
                    (sum, addonRow) => sum + Number(addonRow.quantity ?? 0),
                    0
                );

                if (addonRows.length > 0) {
                    await tx.delete(purchaseItemAddonsTable).where(eq(purchaseItemAddonsTable.purchaseItemId, id));
                }

                await tx.delete(purchaseItemsTable).where(eq(purchaseItemsTable.id, id));
            } else {
                console.log("✏️ Updating purchase item ID:", id, "New Quantity:", purchaseQuantity - quantity);
                await tx.update(purchaseItemsTable)
                    .set({ quantity: purchaseQuantity - quantity })
                    .where(eq(purchaseItemsTable.id, id));

                const addonRows = await tx
                    .select({
                        id: purchaseItemAddonsTable.id,
                        quantity: purchaseItemAddonsTable.quantity,
                    })
                    .from(purchaseItemAddonsTable)
                    .where(eq(purchaseItemAddonsTable.purchaseItemId, id));

                const totalAddonQuantity = addonRows.reduce(
                    (sum, addonRow) => sum + Number(addonRow.quantity ?? 0),
                    0
                );
                let addonOverage = Math.max(0, totalAddonQuantity - newTicketQuantity);

                const addonRowsByNewest = [...addonRows].sort((a, b) => b.id - a.id);

                for (const addonRow of addonRowsByNewest) {
                    if (addonOverage <= 0) {
                        break;
                    }

                    const currentAddonQuantity = Number(addonRow.quantity ?? 0);
                    if (currentAddonQuantity <= addonOverage) {
                        await tx.delete(purchaseItemAddonsTable).where(eq(purchaseItemAddonsTable.id, addonRow.id));
                        addonOverage -= currentAddonQuantity;
                        autoRefundedAddonQuantity += currentAddonQuantity;
                    } else {
                        const newAddonQuantity = currentAddonQuantity - addonOverage;
                        await tx.update(purchaseItemAddonsTable)
                            .set({
                                quantity: newAddonQuantity,
                                updatedAt: new Date(),
                            })
                            .where(eq(purchaseItemAddonsTable.id, addonRow.id));
                        autoRefundedAddonQuantity += addonOverage;
                        addonOverage = 0;
                    }
                }
            }

            // Fetch current totalSold for the ticket
            const ticket = await tx
                .select({ totalSold: ticketsTable.totalSold })
                .from(ticketsTable)
                .where(eq(ticketsTable.id, ticketId))
                .then((res) => res[0] ?? { totalSold: 0 });

            console.log("🎟️ Fetched Ticket:", ticket);

            if (!ticket || typeof ticket.totalSold !== "number") {
                console.error("❌ Ticket not found or totalSold is invalid:", ticket);
                throw new Error("Ticket not found or totalSold is invalid");
            }

            const newTotalSold = Math.max(0, ticket.totalSold - quantity);
            console.log("🔄 Updating ticket totalSold:", newTotalSold);

            await tx.update(ticketsTable)
                .set({ totalSold: sql`${newTotalSold}` }) // Ensure valid type
                .where(eq(ticketsTable.id, ticketId));

            console.log("✅ Ticket updated successfully.");


            await tx.update(purchasesTable)
                .set({ updatedDate: new Date() }) // Store as integer timestamp
                .where(eq(purchasesTable.id, orderId));

            console.log("✅ Purchase updated successfully.");
        });

        console.log("🎉 Refund processed successfully!");
        const remainingAddonQuantity = await db
            .select({
                quantity: sql<number>`COALESCE(SUM(${purchaseItemAddonsTable.quantity}), 0)`,
            })
            .from(purchaseItemAddonsTable)
            .where(eq(purchaseItemAddonsTable.purchaseItemId, id))
            .then(res => Number(res[0]?.quantity ?? 0));

        return NextResponse.json({ 
            success: true, 
            message: "Refund processed successfully",
            data: {
                target: "ticket",
                refundedTicketQuantity: quantity,
                autoRefundedAddonQuantity,
                remainingTicketQuantity: newTicketQuantity,
                remainingAddonQuantity,
                purchaseId: orderId,
                purchaseItemId: id,
            },
        }, { status: 200 });

    } catch (error) {
        console.error("🚨 Error processing refund:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Server error while processing refund", 
            error: String(error) 
        }, { status: 500 });
    }
}
