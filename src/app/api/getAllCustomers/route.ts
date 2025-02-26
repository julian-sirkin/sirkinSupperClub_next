import { NextResponse } from "next/server"
import { db } from "@/db"
import { customersTable, purchasesTable } from "@/db/schema"
import { count, eq, max } from "drizzle-orm"

export async function GET() {
    try {
        const customers = await db
            .select({
                id: customersTable.id,
                name: customersTable.name,
                email: customersTable.email,
                phoneNumber: customersTable.phoneNumber,
                purchaseCount: count(purchasesTable.id).as('purchaseCount'),
                lastPurchase: max(purchasesTable.purchaseDate).as('lastPurchase')
            })
            .from(customersTable)
            .leftJoin(purchasesTable, eq(customersTable.id, purchasesTable.customerId))
            .groupBy(customersTable.id)
            .orderBy(customersTable.name)
        
        return NextResponse.json({
            status: 200,
            customers
        })
    } catch (error) {
        console.error("Error fetching customers:", error)
        return NextResponse.json({
            status: 500,
            message: "Error fetching customers",
            error: error instanceof Error ? error.message : String(error)
        })
    }
} 