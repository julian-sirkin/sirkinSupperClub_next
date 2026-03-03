import type { CartInStateType, CartTicketType } from "../cartStore.types"

export const updateCartHelper = (ticket: CartTicketType, cartInState: CartInStateType ) => {

    let currentTickets = [...cartInState.tickets]
    const isTicketInCart = currentTickets.find(ticketInCart => ticketInCart.contentfulTicketId === ticket.contentfulTicketId)
    const normalizedAddonQuantity = ticket.addonQuantity === undefined
        ? undefined
        : Math.max(0, Math.min(ticket.addonQuantity, ticket.quantity))
    const normalizedTicket: CartTicketType = {
        ...ticket,
        ...(normalizedAddonQuantity !== undefined ? { addonQuantity: normalizedAddonQuantity } : {}),
    }

    /**
     * Handle Updating Ticket Quantity in Tickets Array
     */
    if(isTicketInCart) {
        // If the new quantity is 0, remove from cart, otherwise update the quantity
        if (normalizedTicket.quantity === 0) {
            currentTickets = currentTickets.filter(cartTicket => cartTicket.contentfulTicketId !== normalizedTicket.contentfulTicketId)
        } else {
            currentTickets.forEach(cartTicket => {
                if (cartTicket.contentfulTicketId === normalizedTicket.contentfulTicketId) {
                    cartTicket.quantity = normalizedTicket.quantity
                    if (normalizedTicket.selectedAddonContentfulId !== undefined) {
                        cartTicket.selectedAddonContentfulId = normalizedTicket.selectedAddonContentfulId ?? null
                    }
                    if (normalizedTicket.selectedAddonTitle !== undefined) {
                        cartTicket.selectedAddonTitle = normalizedTicket.selectedAddonTitle ?? null
                    }
                    if (normalizedTicket.selectedAddonPrice !== undefined) {
                        cartTicket.selectedAddonPrice = normalizedTicket.selectedAddonPrice ?? null
                    }
                    if (normalizedTicket.addonQuantity !== undefined) {
                        cartTicket.addonQuantity = normalizedTicket.addonQuantity
                    } else if ((cartTicket.addonQuantity ?? 0) > normalizedTicket.quantity) {
                        cartTicket.addonQuantity = normalizedTicket.quantity
                    }
                }
            })
        }
    }
    else {
        currentTickets.push(normalizedTicket)
    }

    /**
     * Calculate Price
     */
    let currentPrice = 0
    if(currentTickets.length > 0) {
        currentTickets.forEach(ticket => {
            currentPrice += ticket.price * ticket.quantity
            if (ticket.selectedAddonContentfulId && (ticket.addonQuantity ?? 0) > 0) {
                currentPrice += (ticket.selectedAddonPrice ?? 0) * (ticket.addonQuantity ?? 0)
            }
        })
    }

    return { tickets: currentTickets, totalPrice: currentPrice}

}