import { 
  AdminEvent, 
  AdminPurchase, 
  TicketWithPurchases, 
  EventWithTickets,
  CartTicketType,
  CustomerType,
  PurchasedTickets,
  GetTicketByIdAndEventProps,
  DatabaseTickets
} from '@/types';
import type { CartTicketType as StoreCartTicketType } from '@/store/cartStore.types';

// Re-export for backward compatibility
export type {
  AdminEvent,
  AdminPurchase,
  TicketWithPurchases,
  EventWithTickets,
  CartTicketType,
  CustomerType,
  PurchasedTickets,
  GetTicketByIdAndEventProps,
  DatabaseTickets
};

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
    /** The cart lines as submitted, which carry the ticket title, price, and add-on the email needs. */
    tickets: StoreCartTicketType[]
    clientTimeZone?: string
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

export type GetEventTicketsWithPurchasesReturnType = TicketWithPurchases[];

export type EventWithTickets = {
    id: number;
    title: string;
    date: number;
    tickets: TicketWithPurchases[];
};