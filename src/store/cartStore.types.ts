import { ParsedTicket } from "@/app/networkCalls/contentful/contentfulServices.types"

export type CartTicketType = ParsedTicket & {
    quantity: number
    price: number
    eventContentfulId: string
}

export type CartInStateType = {
    tickets: CartTicketType[]
    totalPrice: number
}

export type ZustandCartStateType = {
    cart: CartInStateType
    updateCart: (ticket: CartTicketType) => void
    emptyCart: () => void
}