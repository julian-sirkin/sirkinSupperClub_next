import { NextResponse } from "next/server"
import { PurchasedTickets } from "../api.types"
import { getTicketsByIdAndEvent } from "../queries/select"
import { validateTicketQuantityForPurchase } from "@/app/helpers/validateTicketQuantityForPurchase"

export async function POST(request: Request) {
    const data = await request.json()
    const ticketsInRequest: PurchasedTickets[] = data?.purchasedTickets ?? []

    const ticketsInDatabase = await getTicketsByIdAndEvent(ticketsInRequest)

    const {areQuantitiesAvailable, ticketsWithNotEnoughAvailable} = validateTicketQuantityForPurchase({ticketsInRequest, ticketsInDatabase})
    console.log(ticketsInDatabase, 'ticketsInDatabase')
    return NextResponse.json({status: 200})
}