import { NextResponse } from "next/server";
import { db } from "@/db";
import { purchasesTable, purchaseItemsTable, ticketsTable } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        console.log("🚀 Refund Request Data:", data);

        const { orderId, ticketId, quantity } = data;

        if (!orderId || !ticketId || !quantity || quantity <= 0) {
            console.error("❌ Invalid refund request:", { orderId, ticketId, quantity });
            return NextResponse.json({ 
                success: false, 
                message: "Invalid orderId, ticketId, or quantity" 
            }, { status: 400 });
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

        await db.transaction(async (tx) => {
            console.log("🔄 Starting database transaction...");

            // Delete if refunding all tickets
            if (quantity === purchaseQuantity) {
                console.log("🗑️ Deleting purchase item ID:", id);
                await tx.delete(purchaseItemsTable).where(eq(purchaseItemsTable.id, id));
            } else {
                console.log("✏️ Updating purchase item ID:", id, "New Quantity:", purchaseQuantity - quantity);
                await tx.update(purchaseItemsTable)
                    .set({ quantity: purchaseQuantity - quantity })
                    .where(eq(purchaseItemsTable.id, id));
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
        return NextResponse.json({ 
            success: true, 
            message: "Refund processed successfully" 
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
