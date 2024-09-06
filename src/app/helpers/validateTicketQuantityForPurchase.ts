import { CartTicketType } from "@/store/cartStore.types"
import { DatabaseTickets, PurchasedTickets } from "../api/api.types"

export type ValidateTicketQuantityForPurchaseProps = {
    ticketsInRequest: CartTicketType[]
    ticketsInDatabase: DatabaseTickets[]
}

export const validateTicketQuantityForPurchase = ({ticketsInRequest, ticketsInDatabase}: ValidateTicketQuantityForPurchaseProps ) => {
    let areQuantitiesAvailable = true
    const ticketsWithNotEnoughAvailable: CartTicketType[] = []

    ticketsInRequest.forEach(requestedTicket => {
        const databaseTicket = ticketsInDatabase.find(dbTicket => dbTicket.ticket.contentfulId === requestedTicket.contentfulTicketId)

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