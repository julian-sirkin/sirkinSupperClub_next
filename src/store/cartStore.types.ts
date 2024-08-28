export type CartTicketType = {
    id: string
    quantity: number
    price: number
}

export type CartState = {
    cart: {
        tickets: CartTicketType[]
        totalPrice: number
    }
    updateCart: (ticket: CartTicketType) => void
}