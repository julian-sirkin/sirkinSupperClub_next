import type { CartInStateType, CartTicketType } from "../cartStore.types"

export const updateCartHelper = (ticket: CartTicketType, cartInState: CartInStateType ) => {

    let currentTickets = [...cartInState.tickets]
    const isTicketInCart = currentTickets.find(ticketInCart => ticketInCart.contentfulTicketId === ticket.contentfulTicketId)

    /**
     * Handle Updating Ticket Quantity in Tickets Array
     */
    if(isTicketInCart) {
        // If the new quantity is 0, remove from cart, otherwise update the quantity
        if (ticket.quantity === 0) {
            currentTickets = currentTickets.filter(cartTicket => cartTicket.contentfulTicketId !== ticket.contentfulTicketId)
        } else {
            currentTickets.forEach(cartTicket => {
                if (cartTicket.contentfulTicketId === ticket.contentfulTicketId) {
                    cartTicket.quantity = ticket.quantity
                }
            })
        }
    }
    else {
        currentTickets.push(ticket)
    }

    /**
     * Calculate Price
     */
    let currentPrice = 0
    if(currentTickets.length > 0) {
        currentTickets.forEach(ticket => {
            currentPrice += ticket.price * ticket.quantity
        })
    }

    return { tickets: currentTickets, totalPrice: currentPrice}

}