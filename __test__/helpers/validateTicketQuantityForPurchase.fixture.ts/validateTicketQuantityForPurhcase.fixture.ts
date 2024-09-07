import { DatabaseTickets } from "@/app/api/api.types";
import { CartTicketType } from "@/store/cartStore.types";

export const mockCartTicket1: CartTicketType = {
    contentfulTicketId: 'ticket1',
    eventContentfulId: 'event1',
    quantity: 2,
    price: 100,
    time: new Date(),
    title: 'Test',
    isAddonTicket: false,
    ticketsAvailable: 10
};

export const mockCartTicket2: CartTicketType = {
    contentfulTicketId: 'ticket2',
    eventContentfulId: 'event2',
    quantity: 3,
    price: 100,
    time: new Date(),
    title: 'Test',
    isAddonTicket: false,
    ticketsAvailable: 10
};

export const mockDatabaseTicket1: DatabaseTickets = {
    ticket: {
        time: null,
        id: 1,
        event: 1,
        contentfulId: 'ticket1',
        totalAvailable: 10,
        totalSold: 5
    }
};

export const mockDatabaseTicket2: DatabaseTickets = {
    ticket: {
        time: null,
        id: 2,
        event: 2,
        contentfulId: 'ticket2',
        totalAvailable: 10,
        totalSold: 3
    }
};