import { NextResponse } from "next/server"
import { PurchasedTickets } from "../api.types"
import { getCustomerByEmail, getTicketsByIdAndEvent } from "../queries/select"
import { validateTicketQuantityForPurchase } from "@/app/helpers/validateTicketQuantityForPurchase"
import { createCustomer, createTicketPurchase } from "../queries/insert"
import { CartTicketType } from "@/store/cartStore.types"

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

    const customerId = customerInDatabase[0]?.id ? customerInDatabase[0]?.id : (await createCustomer({email, name: customerName, priorCustomer: false, phoneNumber, notes}))[0].id

    /**
     * Complete purchase
     */
    const {isSuccessful, message} = await createTicketPurchase(ticketsInRequest, customerId, false) 

    if(isSuccessful) {
        return NextResponse.json({status: 200, message})
    } else {
        return NextResponse.json({status: 500, message})
    }
}