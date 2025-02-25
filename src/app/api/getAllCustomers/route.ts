import { NextResponse } from "next/server"
import { db } from "@/db"
import { customersTable, purchasesTable } from "@/db/schema"
import { count, eq, sql } from "drizzle-orm"

export async function GET() {
    try {
        const customers = await db
            .select({
                id: customersTable.id,
                name: customersTable.name,
                email: customersTable.email,
                phoneNumber: customersTable.phoneNumber,
                purchaseCount: sql<number>`COUNT(${purchasesTable.id})`.as('purchaseCount')
            })
            .from(customersTable)
            .leftJoin(purchasesTable, eq(purchasesTable.customerId, customersTable.id))
            .groupBy(customersTable.id, customersTable.name, customersTable.email, customersTable.phoneNumber)
            .orderBy(sql`${customersTable.name} ASC`)
        
        return NextResponse.json({
            status: 200,
            data: customers
        })
    } catch (error) {
        console.error("Error fetching customers:", error)
        return NextResponse.json({
            status: 500,
            message: "Server error while fetching customers",
            error: error instanceof Error ? error.message : String(error)
        })
    }
} 