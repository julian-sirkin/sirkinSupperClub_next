import { create } from 'zustand'
import type { ZustandCartStateType, CartTicketType, CartInStateType } from './cartStore.types'
import { updateCartHelper } from './helpers/updateCart'



export const useCartStore= create<ZustandCartStateType>((set) => ({
    cart: {tickets: [], totalPrice: 0},
    updateCart: (ticket: CartTicketType) => set((state) => {
        const updatedCart = updateCartHelper(ticket, state.cart)
        
        // Filter out tickets with quantity of 0
        const filteredTickets = updatedCart.tickets.filter(t => t.quantity > 0)
        
        // Calculate new total price
        const newTotalPrice = filteredTickets.reduce((acc, t) => {
            const ticketTotal = t.price * t.quantity;
            const addonTotal = t.selectedAddonContentfulId && (t.addonQuantity ?? 0) > 0
                ? (t.selectedAddonPrice ?? 0) * (t.addonQuantity ?? 0)
                : 0;
            return acc + ticketTotal + addonTotal;
        }, 0)
        
        return {...state, cart: {tickets: filteredTickets, totalPrice: newTotalPrice}}
    }),
    emptyCart: () => set(() => ({cart: {tickets: [], totalPrice: 0}}))
}))