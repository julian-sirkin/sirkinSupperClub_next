import { create } from 'zustand'
import type { ZustandCartStateType, CartTicketType, CartInStateType } from './cartStore.types'
import { updateCartHelper } from './helpers/updateCart'



export const useCartStore= create<ZustandCartStateType>((set) => ({
    cart: {tickets: [], totalPrice: 0},
    updateCart: (ticket: CartTicketType) => set((state) => {
        return {...state, cart: updateCartHelper(ticket, state.cart)}
    }),
    emptyCart: () => set((state) => {return {...state, cart: {tickets: [], totalPrice: 0}}})
}))