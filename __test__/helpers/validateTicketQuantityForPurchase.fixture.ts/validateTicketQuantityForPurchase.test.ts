import { CartTicketType } from "@/store/cartStore.types";
import { DatabaseTickets } from "@/app/api/api.types";
import { validateTicketQuantityForPurchase } from "@/app/helpers/validateTicketQuantityForPurchase";
import { mockCartTicket1, mockCartTicket2, mockDatabaseTicket1, mockDatabaseTicket2 } from "./validateTicketQuantityForPurhcase.fixture";


describe('validateTicketQuantityForPurchase', () => {

    it('returns true for empty ticketsInRequest array', () => {
        const ticketsInRequest: CartTicketType[] = [];
        const ticketsInDatabase: DatabaseTickets[] = [mockDatabaseTicket1];

        const result = validateTicketQuantityForPurchase({ ticketsInRequest, ticketsInDatabase });

        expect(result.areQuantitiesAvailable).toBe(true);
        expect(result.ticketsWithNotEnoughAvailable).toEqual([]);
    });

    it('returns false when ticketsInDatabase array is empty', () => {
        const ticketsInRequest: CartTicketType[] = [mockCartTicket1];
        const ticketsInDatabase: DatabaseTickets[] = [];

        const result = validateTicketQuantityForPurchase({ ticketsInRequest, ticketsInDatabase });

        expect(result.areQuantitiesAvailable).toBe(false);
        expect(result.ticketsWithNotEnoughAvailable).toEqual(ticketsInRequest);
    });

    it('returns false when all database tickets are sold out', () => {
        const ticketsInRequest: CartTicketType[] = [mockCartTicket1];
        const ticketsInDatabase: DatabaseTickets[] = [{
            ...mockDatabaseTicket1,
            ticket: { ...mockDatabaseTicket1.ticket, totalSold: 10 }
        }];

        const result = validateTicketQuantityForPurchase({ ticketsInRequest, ticketsInDatabase });

        expect(result.areQuantitiesAvailable).toBe(false);
        expect(result.ticketsWithNotEnoughAvailable).toEqual(ticketsInRequest);
    });

    it('handles duplicated tickets in request correctly', () => {
        const ticketsInRequest: CartTicketType[] = [
            { ...mockCartTicket1, quantity: 3 },
            { ...mockCartTicket1, quantity: 2 }
        ];
        const ticketsInDatabase: DatabaseTickets[] = [mockDatabaseTicket1];

        const result = validateTicketQuantityForPurchase({ ticketsInRequest, ticketsInDatabase });

        expect(result.areQuantitiesAvailable).toBe(true);
        expect(result.ticketsWithNotEnoughAvailable).toEqual([]);
    });

    it('returns true when requested quantity matches available quantity', () => {
        const ticketsInRequest: CartTicketType[] = [{ ...mockCartTicket1, quantity: 5 }];
        const ticketsInDatabase: DatabaseTickets[] = [mockDatabaseTicket1];

        const result = validateTicketQuantityForPurchase({ ticketsInRequest, ticketsInDatabase });

        expect(result.areQuantitiesAvailable).toBe(true);
        expect(result.ticketsWithNotEnoughAvailable).toEqual([]);
    });

    it('One of 2 tickets from request does not have a database counterpart', () => {
        const ticketsInRequest: CartTicketType[] = [mockCartTicket1, mockCartTicket2];
        const ticketsInDatabase: DatabaseTickets[] = [mockDatabaseTicket1];

        const result = validateTicketQuantityForPurchase({ ticketsInRequest, ticketsInDatabase });

        expect(result.areQuantitiesAvailable).toBe(false);
        expect(result.ticketsWithNotEnoughAvailable).toEqual([mockCartTicket2]);
    });

    it('has a ticket with more tickets requested than available in the database', () => {
        const ticketsInRequest: CartTicketType[] = [{ ...mockCartTicket1, quantity: 10 }];
        const ticketsInDatabase: DatabaseTickets[] = [mockDatabaseTicket1];

        const result = validateTicketQuantityForPurchase({ ticketsInRequest, ticketsInDatabase });

        expect(result.areQuantitiesAvailable).toBe(false);
        expect(result.ticketsWithNotEnoughAvailable).toEqual(ticketsInRequest);
    });

    it('has enough tickets in the database for all those in the request', () => {
        const ticketsInRequest: CartTicketType[] = [mockCartTicket1, mockCartTicket2];
        const ticketsInDatabase: DatabaseTickets[] = [mockDatabaseTicket1, mockDatabaseTicket2];

        const result = validateTicketQuantityForPurchase({ ticketsInRequest, ticketsInDatabase });

        expect(result.areQuantitiesAvailable).toBe(true);
        expect(result.ticketsWithNotEnoughAvailable).toEqual([]);
    });

});