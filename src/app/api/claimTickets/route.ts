import { validateTicketQuantityForPurchase } from "@/app/helpers/validateTicketQuantityForPurchase"
import { CartTicketType } from "@/store/cartStore.types"
import { NextResponse } from "next/server"
import { createCustomer, createTicketPurchase } from "../queries/insert"
import { getCustomerByEmail, getTicketsByIdAndEvent } from "../queries/select"
import { successEmail } from "./successEmail"
import { emailFailMessage, successfulRegisteredMessage } from "@/app/constants"

export async function POST(request: Request) {
    /**
     * Pull off Data from request
     */
    const data = await request.json()
    const ticketsInRequest: CartTicketType[] = data?.purchasedTickets ?? []
    const email: string = data?.email ?? ''
    const customerName: string = data?.name ?? ''
    const phoneNumber: string = data?.phoneNumber ?? ''
    const notes: string = data?.notes ?? ''
    const dietaryRestrictions: string = data?.dietaryRestrictions

    /**
     * Verify Requested tickets are available in database
     */
    const ticketsInDatabase = await getTicketsByIdAndEvent(ticketsInRequest)

    const {areQuantitiesAvailable, ticketsWithNotEnoughAvailable} = validateTicketQuantityForPurchase({ticketsInRequest, ticketsInDatabase})

    if(!areQuantitiesAvailable) {
        return NextResponse.json({status: 500, error: {
            message: "Cannot complete order",
            data: ticketsWithNotEnoughAvailable
        }})
    }

    /**
     * Verify Customer exists, if not add them to database
     */
    const customerInDatabase = await getCustomerByEmail(email)

    let customerId: number;
    if (customerInDatabase[0]?.id) {
        customerId = customerInDatabase[0].id;
    } else {
        const customerData = {
            email,
            name: customerName,
            priorCustomer: false,
            phoneNumber: phoneNumber || null,
            notes: notes || null,
            dietaryRestrictions: dietaryRestrictions || null
        };
        
        try {
            const newCustomer = await createCustomer(customerData);
            customerId = newCustomer[0].id;
        } catch (error) {
            return NextResponse.json({
                status: 500,
                message: `Failed to create customer: ${error instanceof Error ? error.message : 'Database error'}`,
                error: 'CUSTOMER_CREATION_FAILED'
            });
        }
    }

    /**
     * Complete purchase
     */
    const {isSuccessful, message} = await createTicketPurchase(ticketsInRequest, customerId, false)

    if(isSuccessful) {
        const {emailSuccessfully} = await successEmail({customer: {name: customerName, email, phoneNumber, notes, dietaryRestrictions}, tickets: ticketsInRequest})
        
        return emailSuccessfully ? NextResponse.json({status: 200, message: successfulRegisteredMessage}) : NextResponse.json({status: 500, message: emailFailMessage})

    } else {
        return NextResponse.json({status: 500, message})
    }
}