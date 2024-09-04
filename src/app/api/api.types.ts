export type PurchasedTickets = {
    eventContentfulId: string
    ticketContentfulId: string
    quantity: number
}

export type GetTicketByIdAndEventProps = {
    ticketContentfulId: string 
    eventContentfulId: string
}

export type DatabaseTickets = {
    ticket: {
        time: Date | null
        id: number
        event: number | null
        contentfulId: string
        totalAvailable: number
        totalSold: number
    }
}