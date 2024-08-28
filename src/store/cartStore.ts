import { create } from 'zustand'
import type { CartState, CartTicketType } from './cartStore.types'
import { updateCartHelper } from './helpers/updateCart'



export const useCartStore= create<CartState>((set) => ({
    cart: {tickets: [], totalPrice: 0},
    updateCart: (ticket: CartTicketType) => set((state) => {
        return updateCartHelper(ticket, state)
    })
}))