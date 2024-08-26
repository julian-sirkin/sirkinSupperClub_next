import { Carter_One } from 'next/font/google'
import {create} from 'zustand'

type CartTicketType = {
    id: string
    quantity: number
    price: number
}

interface CartState {
    cart: CartTicketType[]
    addToCart: (ticket: CartTicketType) => void
}

export const useCartStore= create<CartState>((set) => ({
    cart: [],
    addToCart: (ticket: CartTicketType)  => set((state) => ({ cart: [...state.cart, ticket]})),
}))