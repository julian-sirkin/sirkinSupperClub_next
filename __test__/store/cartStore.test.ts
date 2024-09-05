import { CartInStateType, ZustandCartStateType } from "@/store/cartStore.types"
import { updateCartHelper } from "@/store/helpers/updateCart"

// Updated ticket data with `contentfulId`
const ticket1 = { contentfulId: '1', price: 58, quantity: 1, time: new Date(), ticketsAvailable: 10, title: 'Dinner Ticket', isAddonTicket: false }
const ticket2 = { contentfulId: '2', price: 20, quantity: 4, time: new Date(), ticketsAvailable: 5, title: 'Lunch Ticket', isAddonTicket: false }

const mockCartWithTickets: CartInStateType = { tickets: [ticket1, ticket2], totalPrice: 138 }
const mockEmptyCart: CartInStateType =  { tickets: [], totalPrice: 0 }

describe('cartStore testing suite', () => {

    it('Adds a ticket to a cart if the cart is empty', () => {
      const result = updateCartHelper(ticket2, mockEmptyCart)

      expect(result.tickets[0].quantity).toEqual(4)
      expect(result.totalPrice).toEqual(80)
    })

    it('Updates the quantity of the desired ticket in cart without impacting others', () => {
       const result = updateCartHelper({ ...ticket2, quantity: 6 }, mockCartWithTickets)

       const updatedTicket1 = result.tickets.find(ticket => ticket.contentfulId === ticket1.contentfulId)
       const updatedTicket2 = result.tickets.find(ticket => ticket.contentfulId === ticket2.contentfulId)

       expect(updatedTicket1?.quantity).toEqual(ticket1.quantity)
       expect(updatedTicket2?.quantity).toEqual(6)
       expect(result.totalPrice).toEqual(178)
    })

    it('Removes products from cart if updated quantity is 0', () => {
        const result = updateCartHelper({ ...ticket2, quantity: 0 }, mockCartWithTickets)

        const updatedTicket2 = result.tickets.find(ticket => ticket.contentfulId === ticket2.contentfulId)

        expect(updatedTicket2).toBeUndefined()
        expect(result.totalPrice).toBe(58)
    })
})