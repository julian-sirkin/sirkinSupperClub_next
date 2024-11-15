import { NextResponse } from "next/server"
import { refundOrder } from "../queries/update"


export async function POST(request: Request) {
    const data = await request.json()
    const orderId: number = data?.orderId ? data.orderId : 0
    const quantity: number = data?.quantity ? data.quantity: 0
    console.log
    if (orderId === 0 || quantity === 0) {
        return NextResponse.json({status: 500})
    }

    try{
        const orderResult = refundOrder(orderId, quantity)
        console.log('great success')
        return NextResponse.json({status: 200, data: orderResult})
    }
    catch (e) {
        console.log('I failed miserably')
        return NextResponse.json({status: 500, e})
    }
}