import { create } from 'zustand'

type CartTicketType = {
    id: string
    quantity: number
    price: number
}

interface CartState {
    cart: {
        tickets: CartTicketType[]
        totalPrice: number
    }
    updateCart: (ticket: CartTicketType) => void
}

export const useCartStore= create<CartState>((set) => ({
    cart: {tickets: [], totalPrice: 0},
    // addToCart: (ticket: CartTicketType)  => set((state) => ({ cart: [...state.cart, ticket]})),
    updateCart: (ticket: CartTicketType) => set((state) => {
        const currentTickets = [...state.cart.tickets]
        const isTicketInCart = currentTickets.find(ticketInCart => ticketInCart.id === ticket.id)

        /**
         * Handle Updating Ticket Quantity in Tickets Array
         */
        if(isTicketInCart) {
            // If the new quantity is 0, remove from cart, otherwise update the quantity
            if (ticket.quantity === 0) {
                currentTickets.filter(cartTicket => cartTicket.id !== ticket.id)
            } else {
                currentTickets.map(cartTicket => {
                    if (cartTicket.id === ticket.id) {
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

        console.log(currentTickets, 'currentTickets')
        console.log(currentPrice, 'currentPrice')
        return {...state, tickets: currentTickets, totalPrice: currentPrice}
    })
}))