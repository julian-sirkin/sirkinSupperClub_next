import { DatabaseTickets, PurchasedTickets } from "../api/api.types"

export type ValidateTicketQuantityForPurchaseProps = {
    ticketsInRequest: PurchasedTickets[]
    databaseTickets: DatabaseTickets[]
}

export const validateTicketQuantityForPurchase = ({ticketsInRequest, databaseTickets}: ValidateTicketQuantityForPurchaseProps ) => {
    let areQuantitiesAvailable = true
    const ticketsWithNotEnoughAvailable: PurchasedTickets[] = []

    ticketsInRequest.forEach(requestedTicket => {
        const databaseTicket = databaseTickets.find(dbTicket => dbTicket.ticket.contentfulId === requestedTicket.ticketContentfulId)

        if(databaseTicket) {
            const remainingTickets = databaseTicket.ticket.totalAvailable - databaseTicket.ticket.totalSold
            
            if(remainingTickets < requestedTicket.quantity) {
                ticketsWithNotEnoughAvailable.push(requestedTicket)
                areQuantitiesAvailable = false
            } 
        } else {
            areQuantitiesAvailable = false
            ticketsWithNotEnoughAvailable.push(requestedTicket)
        }
    })   

    return {areQuantitiesAvailable, ticketsWithNotEnoughAvailable}
}