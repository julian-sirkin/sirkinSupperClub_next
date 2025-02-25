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

export type adminEvent = {
    id: number
    title: string
    date: number
    ticketsAvailable: number
    ticketsSold: number
};

export type adminEventDetails = {
    id: number
    tickets: {
        time: Date
        totalAvailable: number
        totalSold: number
        Purchases: {
            customerId: number
            purchaseId: number
            purchaseItemsId: number
            customerName: string
        }[]
    }[]
}

export type AdminPurchase = {
    purchaseId: number;
    customerId: number;
    customerName: string;
    customerEmail: string;
    quantity: number;
    paid: boolean;
    purchaseDate: number;
    purchaseItemsId?: number;
    refundDate?: number | null;
    ticketId: number;
    dietaryRestrictions?: string;
    notes?: string;
};

export type TicketWithPurchases = {
    ticketId: number;
    ticketTime: number;
    totalAvailable: number;
    totalSold: number;
    purchases: AdminPurchase[];
};

export type GetEventTicketsWithPurchasesReturnType = TicketWithPurchases[];

export type EventWithTickets = {
    id: number;
    title: string;
    date: number;
    tickets: TicketWithPurchases[];
};