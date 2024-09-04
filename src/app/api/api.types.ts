export type PurchasedTickets = {
    eventContentfulId: string
    ticketContentfulId: string
    quantity: number
}

export type GetTicketByIdAndEvent = {
    ticketContentfulId: string eventContentfulId: string
}