import { CartTicketType } from "@/store/cartStore.types"

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

export type UpdatedTicketFields = {
    totalAvailable?: number;
    id?: number 
    time?: Date 
    event?: number 
    price?: number 
}

export type UpdatedEventFields = {
title?: string
date?: Date 
}

export type SuccessEmailProps = {
    customer: {
        email: string
        name: string
        notes: string
        dietaryRestrictions: string
        phoneNumber: string
    }
    tickets: CartTicketType[]
}