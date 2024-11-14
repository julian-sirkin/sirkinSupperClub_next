import { NextResponse } from "next/server"
import { getEventTicketsWithPurchases } from "../queries/select"

export async function POST(request: Request) {
    const data = await request.json()
    const eventId: number = Number(data?.eventId) ?? 0
    console.log(eventId, 'eventId ====>>>>')
    console.log(data, 'data ======>>>>>>')
    if (!eventId) {
        return NextResponse.json({status: 500})
    }
    console.log('before try statement')
    try {
    const eventDetails = await getEventTicketsWithPurchases(eventId)
    console.log(eventDetails, 'Event Details =======>>>>>>>')
    return NextResponse.json({status: 200, data: eventDetails})
} catch(err) {
    console.log('in catch')
    return NextResponse.json({status: 500, err})
}
}