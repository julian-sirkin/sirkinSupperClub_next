import { NextResponse } from "next/server";
import { getEventTicketsWithPurchases } from "../queries/select";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const eventId: number = Number(data?.eventId) || 0;

        if (!eventId) {
            return NextResponse.json({
                status: 400,
                message: "Missing or invalid eventId",
            });
        }

        console.log(`🚀 Fetching details for event ID: ${eventId}`);
        const eventDetails = await getEventTicketsWithPurchases(eventId);

        if (!eventDetails) {
            return NextResponse.json({
                status: 404,
                message: "Event not found or no associated tickets",
            });
        }

        console.log(`📊 Event details fetched. Title: ${eventDetails.title}, Tickets: ${eventDetails.tickets.length}`);

        return NextResponse.json({
            status: 200,
            data: eventDetails,
        });
    } catch (err) {
        console.error("🚨 Error fetching event details:", err);
        return NextResponse.json({
            status: 500,
            message: "Error fetching event details",
            error: err instanceof Error ? err.message : String(err),
        });
    }
}