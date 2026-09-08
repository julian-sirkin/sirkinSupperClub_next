import { NextResponse } from "next/server";
import { db } from "@/db";
import { customersTable, purchasesTable, purchaseItemsTable, ticketsTable, eventsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdminRequest, unauthorizedAdminResponse } from "../utils/isAdminRequest";

export async function POST(request: Request) {
    if (!(await isAdminRequest(request))) {
        return unauthorizedAdminResponse();
    }

    try {
        const data = await request.json();
        const customerId = Number(data?.customerId);
        console.log("🚀 Incoming Request Data:", { customerId });

        if (!customerId) {
            console.error("❌ Invalid customerId:", customerId);
            return NextResponse.json({ status: 400, message: "Missing or invalid customerId" });
        }

        // Fetch customer details
        const customerDetails = await db
            .select()
            .from(customersTable)
            .where(eq(customersTable.id, customerId))
            .then(res => res[0] || null);

        if (!customerDetails) {
            console.error("❌ Customer not found:", customerId);
            return NextResponse.json({ status: 404, message: "Customer not found" });
        }

        console.log("✅ Customer Details:", customerDetails);

        // Fetch customer's purchases
        const customerPurchases = await db
            .select({
                id: purchasesTable.id,
                purchaseDate: purchasesTable.purchaseDate,
                paid: purchasesTable.paid
            })
            .from(purchasesTable)
            .where(eq(purchasesTable.customerId, customerId));

        if (!customerPurchases.length) {
            console.warn("⚠️ No purchases found for customer:", customerId);
        }

        console.log("✅ Customer Purchases:", customerPurchases);

        // Fetch purchase items
        const purchaseItems = await Promise.all(
            customerPurchases.map(async (purchase) => {
                const items = await db
                    .select({
                        quantity: purchaseItemsTable.quantity,
                        ticketId: purchaseItemsTable.ticketId
                    })
                    .from(purchaseItemsTable)
                    .where(eq(purchaseItemsTable.purchaseId, purchase.id));

                return items.map(item => ({
                    ...item,
                    purchaseId: purchase.id,
                    purchaseDate: purchase.purchaseDate,
                    paid: purchase.paid
                }));
            })
        );

        // Flatten array
        const flattenedPurchaseItems = purchaseItems.flat();
        console.log("✅ Flattened Purchase Items:", flattenedPurchaseItems);

        // Fetch ticket details for each purchase item
        const ticketDetails = await Promise.all(
            flattenedPurchaseItems.map(async (item) => {
                const ticket = await db
                    .select()
                    .from(ticketsTable)
                    .where(eq(ticketsTable.id, item.ticketId))
                    .then(res => res[0] || null);

                if (!ticket) {
                    console.warn("⚠️ Ticket not found for ticketId:", item.ticketId);
                    return null;
                }

                const event = await db
                    .select()
                    .from(eventsTable)
                    .where(eq(eventsTable.id, ticket.event))
                    .then(res => res[0] || null);

                if (!event) {
                    console.warn("⚠️ Event not found for ticket eventId:", ticket.event);
                    return null;
                }

                return {
                    purchaseId: item.purchaseId,
                    eventId: event.id,
                    eventTitle: event.title,
                    eventDate: event.date,
                    ticketTime: ticket.time,
                    quantity: item.quantity,
                    paid: item.paid,
                    purchaseDate: item.purchaseDate
                };
            })
        );

        // Remove null values
        const purchases = ticketDetails.filter(item => item !== null);
        console.log("✅ Final Purchases Data:", purchases);

        // Combine customer details with purchases
        const customer = {
            ...customerDetails,
            purchases
        };

        return NextResponse.json({ status: 200, customer });
    } catch (error) {
        console.error("🚨 Error fetching customer details:", error);
        return NextResponse.json({
            status: 500,
            message: "Server error while fetching customer details",
            error: String(error)
        });
    }
}
