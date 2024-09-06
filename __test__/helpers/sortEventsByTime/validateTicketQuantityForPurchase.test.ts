import { CartTicketType } from "@/store/cartStore.types";
import { DatabaseTickets } from "@/app/api/api.types";
import { validateTicketQuantityForPurchase } from "@/app/helpers/validateTicketQuantityForPurchase";

describe('validateTicketQuantityForPurchase', () => {

    it('returns true for empty ticketsInRequest array', () => {
        const ticketsInRequest: CartTicketType[] = [];
        const ticketsInDatabase: DatabaseTickets[] = [
            { ticket: { time: null, id: 1, event: 1, contentfulId: 'ticket1', totalAvailable: 10, totalSold: 5 } }
        ];

        const result = validateTicketQuantityForPurchase({ ticketsInRequest, ticketsInDatabase });

        expect(result.areQuantitiesAvailable).toBe(true);
        expect(result.ticketsWithNotEnoughAvailable).toEqual([]);
    });

    it('returns false when ticketsInDatabase array is empty', () => {
        const ticketsInRequest: CartTicketType[] = [
            { contentfulTicketId: 'ticket1', eventContentfulId: 'event1', quantity: 2, price: 100, time: new Date(), title: 'Test', isAddonTicket: false, ticketsAvailable: 10 }
        ];
        const ticketsInDatabase: DatabaseTickets[] = [];

        const result = validateTicketQuantityForPurchase({ ticketsInRequest, ticketsInDatabase });

        expect(result.areQuantitiesAvailable).toBe(false);
        expect(result.ticketsWithNotEnoughAvailable).toEqual(ticketsInRequest);
    });

    it('returns false when all database tickets are sold out', () => {
        const ticketsInRequest: CartTicketType[] = [
            { contentfulTicketId: 'ticket1', eventContentfulId: 'event1', quantity: 1, price: 100, time: new Date(), title: 'Test', isAddonTicket: false, ticketsAvailable: 10 }
        ];
        const ticketsInDatabase: DatabaseTickets[] = [
            { ticket: { time: null, id: 1, event: 1, contentfulId: 'ticket1', totalAvailable: 10, totalSold: 10 } }
        ];

        const result = validateTicketQuantityForPurchase({ ticketsInRequest, ticketsInDatabase });

        expect(result.areQuantitiesAvailable).toBe(false);
        expect(result.ticketsWithNotEnoughAvailable).toEqual(ticketsInRequest);
    });

    it('handles duplicated tickets in request correctly', () => {
        const ticketsInRequest: CartTicketType[] = [
            { contentfulTicketId: 'ticket1', eventContentfulId: 'event1', quantity: 3, price: 100, time: new Date(), title: 'Test', isAddonTicket: false, ticketsAvailable: 10 },
            { contentfulTicketId: 'ticket1', eventContentfulId: 'event1', quantity: 2, price: 100, time: new Date(), title: 'Test', isAddonTicket: false, ticketsAvailable: 10 }
        ];
        const ticketsInDatabase: DatabaseTickets[] = [
            { ticket: { time: null, id: 1, event: 1, contentfulId: 'ticket1', totalAvailable: 10, totalSold: 5 } }
        ];

        const result = validateTicketQuantityForPurchase({ ticketsInRequest, ticketsInDatabase });

        expect(result.areQuantitiesAvailable).toBe(true);
        expect(result.ticketsWithNotEnoughAvailable).toEqual([]);
    });

    it('returns true when requested quantity matches available quantity', () => {
        const ticketsInRequest: CartTicketType[] = [
            { contentfulTicketId: 'ticket1', eventContentfulId: 'event1', quantity: 5, price: 100, time: new Date(), title: 'Test', isAddonTicket: false, ticketsAvailable: 10 }
        ];
        const ticketsInDatabase: DatabaseTickets[] = [
            { ticket: { time: null, id: 1, event: 1, contentfulId: 'ticket1', totalAvailable: 10, totalSold: 5 } }
        ];

        const result = validateTicketQuantityForPurchase({ ticketsInRequest, ticketsInDatabase });

        expect(result.areQuantitiesAvailable).toBe(true);
        expect(result.ticketsWithNotEnoughAvailable).toEqual([]);
    });

    it('One of 2 tickets from request does not have a database counterpart', () => {
        const ticketsInRequest: CartTicketType[] = [
            { contentfulTicketId: 'ticket1', eventContentfulId: 'event1', quantity: 2, price: 100, time: new Date(), title: 'Test', isAddonTicket: false, ticketsAvailable: 10 },
            { contentfulTicketId: 'ticket2', eventContentfulId: 'event2', quantity: 3, price: 100, time: new Date(), title: 'Test', isAddonTicket: false, ticketsAvailable: 10 }
        ];

        const ticketsInDatabase: DatabaseTickets[] = [
            { ticket: { time: null, id: 1, event: 1, contentfulId: 'ticket1', totalAvailable: 5, totalSold: 1 } }
            // Note: 'ticket2' is missing in the ticketsInDatabase array
        ];

        const result = validateTicketQuantityForPurchase({ ticketsInRequest, ticketsInDatabase });

        expect(result.areQuantitiesAvailable).toBe(false);
        expect(result.ticketsWithNotEnoughAvailable).toEqual([
            { contentfulTicketId: 'ticket2', eventContentfulId: 'event2', quantity: 3, price: 100, time: new Date(), title: 'Test', isAddonTicket: false, ticketsAvailable: 10 }
        ]);
    });

    it('has a ticket with more tickets requested than available in the database', () => {
        const ticketsInRequest: CartTicketType[] = [
            { contentfulTicketId: 'ticket1', eventContentfulId: 'event1', quantity: 10, price: 100, time: new Date(), title: 'Test', isAddonTicket: false, ticketsAvailable: 10 }
        ];

        const ticketsInDatabase: DatabaseTickets[] = [
            { ticket: { time: null, id: 1, event: 1, contentfulId: 'ticket1', totalAvailable: 10, totalSold: 5 } }
        ];

        const result = validateTicketQuantityForPurchase({ ticketsInRequest, ticketsInDatabase });

        expect(result.areQuantitiesAvailable).toBe(false);
        expect(result.ticketsWithNotEnoughAvailable).toEqual([
            { contentfulTicketId: 'ticket1', eventContentfulId: 'event1', quantity: 10, price: 100, time: new Date(), title: 'Test', isAddonTicket: false, ticketsAvailable: 10 }
        ]);
    });

    it('has enough tickets in the database for all those in the request', () => {
        const ticketsInRequest: CartTicketType[] = [
            { contentfulTicketId: 'ticket1', eventContentfulId: 'event1', quantity: 2, price: 100, time: new Date(), title: 'Test', isAddonTicket: false, ticketsAvailable: 10 },
            { contentfulTicketId: 'ticket2', eventContentfulId: 'event2', quantity: 3, price: 100, time: new Date(), title: 'Test', isAddonTicket: false, ticketsAvailable: 10 }
        ];

        const ticketsInDatabase: DatabaseTickets[] = [
            { ticket: { time: null, id: 1, event: 1, contentfulId: 'ticket1', totalAvailable: 10, totalSold: 5 } },
            { ticket: { time: null, id: 2, event: 2, contentfulId: 'ticket2', totalAvailable: 10, totalSold: 3 } }
        ];

        const result = validateTicketQuantityForPurchase({ ticketsInRequest, ticketsInDatabase });

        expect(result.areQuantitiesAvailable).toBe(true);
        expect(result.ticketsWithNotEnoughAvailable).toEqual([]);
    });

});