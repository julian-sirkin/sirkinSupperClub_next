import { NextResponse } from "next/server"
import { PurchasedTickets } from "../api.types"
import { getTicketsByIdAndEvent } from "../queries/select"

export async function POST(request: Request) {
    const data = await request.json()
    const purchasedTickets: PurchasedTickets[] = data?.purchasedTickets ?? []

    const ticketsInDatabase = await getTicketsByIdAndEvent(purchasedTickets)
    console.log(ticketsInDatabase, 'ticketsInDatabase')
    return NextResponse.json({status: 200})
}