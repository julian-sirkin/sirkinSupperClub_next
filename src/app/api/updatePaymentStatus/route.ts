import { NextResponse } from "next/server"
import { db } from "@/db"
import { purchasesTable } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { purchaseId, paid } = data;
        
        if (!purchaseId) {
            return NextResponse.json({ message: "Missing or invalid purchaseId" }, { status: 400 });
        }

        if (paid === undefined) {
            return NextResponse.json({ message: "Missing paid status" }, { status: 400 });
        }

        // Update payment status and return the updated row
        const updatedPurchase = await db
            .update(purchasesTable)
            .set({ 
                paid: paid ? 1 : 0,
                updatedDate: new Date() // ✅ Use a Date object
            })
            .where(eq(purchasesTable.id, purchaseId))
            .returning();

        if (updatedPurchase.length === 0) {
            return NextResponse.json({ message: "Purchase not found or update failed" }, { status: 404 });
        }

        return NextResponse.json({ 
            message: `Payment status updated to ${paid ? 'Paid' : 'Unpaid'}`, 
            updatedPurchase: updatedPurchase[0] 
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating payment status:", error);
        return NextResponse.json({ 
            message: "Server error while updating payment status",
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}