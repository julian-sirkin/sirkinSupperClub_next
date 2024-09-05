import { ParsedTicket } from "@/app/contentful/contentfulServices.types"

export type CartTicketType = ParsedTicket & {
    quantity: number
    price: number
}

export type CartInStateType = {
    tickets: CartTicketType[]
    totalPrice: number
}

export type ZustandCartStateType = {
    cart: CartInStateType
    updateCart: (ticket: CartTicketType) => void
}