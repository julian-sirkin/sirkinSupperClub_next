import { DatabaseTickets, PurchasedTickets } from "@/app/api/api.types";
import { validateTicketQuantityForPurchase } from "@/app/helpers/validateTicketQuantityForPurchase";


describe('validateTicketQuantityForPurchase', () => {

    it('returns true for empty ticketsInRequest array', () => {
        const ticketsInRequest: PurchasedTickets[] = [];
        const databaseTickets: DatabaseTickets[] = [
            { ticket: { time: null, id: 1, event: 1, contentfulId: 'ticket1', totalAvailable: 10, totalSold: 5 } }
        ];
    
        const result = validateTicketQuantityForPurchase({ ticketsInRequest, databaseTickets });
    
        expect(result.areQuantitiesAvailable).toBe(true);
        expect(result.ticketsWithNotEnoughAvailable).toEqual([]);
    });

    it('returns false when databaseTickets array is empty', () => {
        const ticketsInRequest: PurchasedTickets[] = [
            { ticketContentfulId: 'ticket1', eventContentfulId: 'event1', quantity: 2 }
        ];
        const databaseTickets: DatabaseTickets[] = [];
    
        const result = validateTicketQuantityForPurchase({ ticketsInRequest, databaseTickets });
    
        expect(result.areQuantitiesAvailable).toBe(false);
        expect(result.ticketsWithNotEnoughAvailable).toEqual(ticketsInRequest);
    });

    it('returns false when all database tickets are sold out', () => {
        const ticketsInRequest: PurchasedTickets[] = [
            { ticketContentfulId: 'ticket1', eventContentfulId: 'event1', quantity: 1 }
        ];
        const databaseTickets: DatabaseTickets[] = [
            { ticket: { time: null, id: 1, event: 1, contentfulId: 'ticket1', totalAvailable: 10, totalSold: 10 } }
        ];
    
        const result = validateTicketQuantityForPurchase({ ticketsInRequest, databaseTickets });
    
        expect(result.areQuantitiesAvailable).toBe(false);
        expect(result.ticketsWithNotEnoughAvailable).toEqual(ticketsInRequest);
    });

    it('handles duplicated tickets in request correctly', () => {
        const ticketsInRequest: PurchasedTickets[] = [
            { ticketContentfulId: 'ticket1', eventContentfulId: 'event1', quantity: 3 },
            { ticketContentfulId: 'ticket1', eventContentfulId: 'event1', quantity: 2 }
        ];
        const databaseTickets: DatabaseTickets[] = [
            { ticket: { time: null, id: 1, event: 1, contentfulId: 'ticket1', totalAvailable: 10, totalSold: 5 } }
        ];
    
        const result = validateTicketQuantityForPurchase({ ticketsInRequest, databaseTickets });
    
        expect(result.areQuantitiesAvailable).toBe(true);
        expect(result.ticketsWithNotEnoughAvailable).toEqual([]);
    });
    

    it('returns true when requested quantity matches available quantity', () => {
        const ticketsInRequest: PurchasedTickets[] = [
            { ticketContentfulId: 'ticket1', eventContentfulId: 'event1', quantity: 5 }
        ];
        const databaseTickets: DatabaseTickets[] = [
            { ticket: { time: null, id: 1, event: 1, contentfulId: 'ticket1', totalAvailable: 10, totalSold: 5 } }
        ];
    
        const result = validateTicketQuantityForPurchase({ ticketsInRequest, databaseTickets });
    
        expect(result.areQuantitiesAvailable).toBe(true);
        expect(result.ticketsWithNotEnoughAvailable).toEqual([]);
    });



    it('One of 2 tickets from request does not have a database counterpart', () => {
        const ticketsInRequest: PurchasedTickets[] = [
            { ticketContentfulId: 'ticket1', eventContentfulId: 'event1', quantity: 2 },
            { ticketContentfulId: 'ticket2', eventContentfulId: 'event2', quantity: 3 }
        ];

        const databaseTickets: DatabaseTickets[] = [
            { ticket: { time: null, id: 1, event: 1, contentfulId: 'ticket1', totalAvailable: 5, totalSold: 1 } }
            // Note: 'ticket2' is missing in the databaseTickets array
        ];

        const result = validateTicketQuantityForPurchase({ ticketsInRequest, databaseTickets });

        expect(result.areQuantitiesAvailable).toBe(false);
        expect(result.ticketsWithNotEnoughAvailable).toEqual([
            { ticketContentfulId: 'ticket2', eventContentfulId: 'event2', quantity: 3 }
        ]);
    });

    it('has a ticket with more tickets requested than available in the database', () => {
        const ticketsInRequest: PurchasedTickets[] = [
            { ticketContentfulId: 'ticket1', eventContentfulId: 'event1', quantity: 10 }
        ];

        const databaseTickets: DatabaseTickets[] = [
            { ticket: { time: null, id: 1, event: 1, contentfulId: 'ticket1', totalAvailable: 10, totalSold: 5 } }
        ];

        const result = validateTicketQuantityForPurchase({ ticketsInRequest, databaseTickets });

        expect(result.areQuantitiesAvailable).toBe(false);
        expect(result.ticketsWithNotEnoughAvailable).toEqual([
            { ticketContentfulId: 'ticket1', eventContentfulId: 'event1', quantity: 10 }
        ]);
    });

    it('has enough tickets in the database for all those in the request', () => {
        const ticketsInRequest: PurchasedTickets[] = [
            { ticketContentfulId: 'ticket1', eventContentfulId: 'event1', quantity: 2 },
            { ticketContentfulId: 'ticket2', eventContentfulId: 'event2', quantity: 3 }
        ];

        const databaseTickets: DatabaseTickets[] = [
            { ticket: { time: null, id: 1, event: 1, contentfulId: 'ticket1', totalAvailable: 10, totalSold: 5 } },
            { ticket: { time: null, id: 2, event: 2, contentfulId: 'ticket2', totalAvailable: 10, totalSold: 3 } }
        ];

        const result = validateTicketQuantityForPurchase({ ticketsInRequest, databaseTickets });

        expect(result.areQuantitiesAvailable).toBe(true);
        expect(result.ticketsWithNotEnoughAvailable).toEqual([]);
    });



});