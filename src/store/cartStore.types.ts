export type CartTicketType = {
    id: string
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