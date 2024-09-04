// import { createTicketPurchase } from "@/app/api/queries/insert";
// import { db } from "@/db";


// jest.mock("@/db"); // Mocking the database connection

// describe.skip('createEventPurchase', () => {
//     const mockDb = {
//         transaction: jest.fn(),
//         insert: jest.fn(),
//         select: jest.fn(),
//         update: jest.fn()
//     };
    
//     beforeEach(() => {
//         (db as any).transaction = mockDb.transaction;
//         mockDb.transaction.mockImplementation(fn => fn(mockDb));
//     });

//     it('should create a purchase and return success', async () => {
//         // Mock the database responses
//         mockDb.insert.mockResolvedValueOnce([{ id: 1 }]); // Mock purchase insert returning purchase ID
//         mockDb.select.mockResolvedValueOnce([{ id: 1, totalAvailable: 10, totalSold: 2 }]); // Mock ticket found with available stock
//         mockDb.update.mockResolvedValueOnce(null); // Mock ticket update success
//         mockDb.insert.mockResolvedValueOnce(null); // Mock purchase item insert success

//         const purchasedTickets = [
//             { eventContentfulId: 'event1', ticketContentfulId: 'ticket1', quantity: 2 }
//         ];
//         const result = await createTicketPurchase(purchasedTickets, 1, true);

//         expect(result).toEqual({ success: true, message: 'Purchase created successfully.' });
//         expect(mockDb.insert).toHaveBeenCalledTimes(2); // One for purchase, one for purchase item
//         expect(mockDb.update).toHaveBeenCalledTimes(1); // One update for tickets sold
//     });

//     it('should return an error if not enough tickets are available', async () => {
//         mockDb.insert.mockResolvedValueOnce([{ id: 1 }]);
//         mockDb.select.mockResolvedValueOnce([{ id: 1, totalAvailable: 5, totalSold: 5 }]); // No available tickets

//         const purchasedTickets = [
//             { eventContentfulId: 'event1', ticketContentfulId: 'ticket1', quantity: 1 }
//         ];
//         const result = await createTicketPurchase(purchasedTickets, 1, true);

//         expect(result).toEqual({
//             success: false,
//             message: 'Error creating purchase: Not enough tickets available for Contentful ID ticket1'
//         });
//         expect(mockDb.update).not.toHaveBeenCalled(); // No update should be made
//     });

//     it('should return an error if the ticket is not found', async () => {
//         mockDb.insert.mockResolvedValueOnce([{ id: 1 }]);
//         mockDb.select.mockResolvedValueOnce([]); // Ticket not found

//         const purchasedTickets = [
//             { eventContentfulId: 'event1', ticketContentfulId: 'ticket1', quantity: 1 }
//         ];
//         const result = await createTicketPurchase(purchasedTickets, 1, true);

//         expect(result).toEqual({
//             success: false,
//             message: 'Error creating purchase: Ticket with Contentful ID ticket1 not found'
//         });
//         expect(mockDb.update).not.toHaveBeenCalled();
//     });
// });