import { NextResponse } from "next/server"
import { getEventTicketsWithPurchases } from "../queries/select"

export async function POST(request: Request) {
    try {
        const data = await request.json()
        const eventId: number = Number(data?.eventId) ?? 0

        if (!eventId) {
            return NextResponse.json({
                status: 400,
                message: "Missing or invalid eventId"
            })
        }
        
        try {
            console.log(`Fetching details for event ID: ${eventId}`);
            const eventDetails = await getEventTicketsWithPurchases(eventId)
            console.log(`Event details fetched. Title: ${eventDetails.title}, Tickets: ${eventDetails.tickets.length}`);
            
            // Log ticket details
            eventDetails.tickets.forEach((ticket, index) => {
                console.log(`Ticket ${index + 1}: ID ${ticket.ticketId}, Purchases: ${ticket.purchases.length}`);
            });
            
            return NextResponse.json({
                status: 200, 
                data: eventDetails
            })
        } catch (err) {
            console.error("Error fetching event details:", err)
            return NextResponse.json({
                status: 500, 
                message: "Error fetching event details",
                error: err instanceof Error ? err.message : String(err)
            })
        }
    } catch (err) {
        console.error("Error parsing request:", err)
        return NextResponse.json({
            status: 400, 
            message: "Invalid request format"
        })
    }
}