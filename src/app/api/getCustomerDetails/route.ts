import { NextResponse } from "next/server"
import { db } from "@/db"
import { customersTable, eventsTable, purchasesTable, ticketsTable } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: Request) {
    try {
        const data = await request.json()
        const customerId = Number(data?.customerId)
        
        if (!customerId) {
            return NextResponse.json({
                status: 400,
                message: "Missing or invalid customerId"
            })
        }
        
        // Get customer details
        const customerDetails = await db
            .select()
            .from(customersTable)
            .where(eq(customersTable.id, customerId))
        
        if (customerDetails.length === 0) {
            return NextResponse.json({
                status: 404,
                message: "Customer not found"
            })
        }
        
        // Get customer's purchases with event and ticket details
        const purchases = await db
            .select({
                purchaseId: purchasesTable.id,
                purchaseDate: purchasesTable.purchaseDate,
                quantity: purchasesTable.quantity,
                ticketId: ticketsTable.id,
                ticketTime: ticketsTable.time,
                eventId: eventsTable.id,
                eventTitle: eventsTable.title,
                eventDate: eventsTable.date
            })
            .from(purchasesTable)
            .innerJoin(ticketsTable, eq(purchasesTable.ticketId, ticketsTable.id))
            .innerJoin(eventsTable, eq(ticketsTable.event, eventsTable.id))
            .where(eq(purchasesTable.customerId, customerId))
            .orderBy(eventsTable.date, ticketsTable.time)
        
        // Combine customer details with purchases
        const customerWithPurchases = {
            ...customerDetails[0],
            purchases
        }
        
        return NextResponse.json({
            status: 200,
            data: customerWithPurchases
        })
    } catch (error) {
        console.error("Error fetching customer details:", error)
        return NextResponse.json({
            status: 500,
            message: "Server error while fetching customer details",
            error: error instanceof Error ? error.message : String(error)
        })
    }
} 