import type { CartInStateType, CartTicketType } from "../cartStore.types";
import { updateCartHelper } from "./updateCart";

const buildTicket = (overrides: Partial<CartTicketType> = {}): CartTicketType => ({
  contentfulTicketId: "ticket-1",
  eventContentfulId: "event-1",
  quantity: 1,
  time: new Date("2026-04-01T18:00:00.000Z"),
  ticketsAvailable: 20,
  title: "Dinner Ticket",
  price: 100,
  isAddonTicket: false,
  addons: [],
  ...overrides,
});

const emptyCart: CartInStateType = {
  tickets: [],
  totalPrice: 0,
};

describe("updateCartHelper", () => {
  it("calculates total using ticket price only when no addon is selected", () => {
    const updatedCart = updateCartHelper(
      buildTicket({ quantity: 2 }),
      emptyCart
    );

    expect(updatedCart.totalPrice).toBe(200);
    expect(updatedCart.tickets[0].selectedAddonContentfulId).toBeUndefined();
  });

  it("includes addon subtotal when addon is selected with valid quantity", () => {
    const updatedCart = updateCartHelper(
      buildTicket({
        quantity: 2,
        selectedAddonContentfulId: "addon-1",
        selectedAddonTitle: "Wine Pairing",
        selectedAddonPrice: 25,
        addonQuantity: 2,
      }),
      emptyCart
    );

    expect(updatedCart.totalPrice).toBe(250);
    expect(updatedCart.tickets[0].addonQuantity).toBe(2);
  });

  it("clamps addon quantity to ticket quantity when ticket quantity decreases", () => {
    const initialCart = updateCartHelper(
      buildTicket({
        quantity: 3,
        selectedAddonContentfulId: "addon-1",
        selectedAddonTitle: "Wine Pairing",
        selectedAddonPrice: 20,
        addonQuantity: 3,
      }),
      emptyCart
    );

    const updatedCart = updateCartHelper(
      buildTicket({
        quantity: 1,
      }),
      initialCart
    );

    expect(updatedCart.tickets[0].addonQuantity).toBe(1);
    expect(updatedCart.totalPrice).toBe(120);
  });

  it("clears addon total when addon is deselected", () => {
    const cartWithAddon = updateCartHelper(
      buildTicket({
        quantity: 2,
        selectedAddonContentfulId: "addon-1",
        selectedAddonTitle: "Wine Pairing",
        selectedAddonPrice: 15,
        addonQuantity: 2,
      }),
      emptyCart
    );

    const clearedAddonCart = updateCartHelper(
      buildTicket({
        quantity: 2,
        selectedAddonContentfulId: null,
        selectedAddonTitle: null,
        selectedAddonPrice: null,
        addonQuantity: 0,
      }),
      cartWithAddon
    );

    expect(clearedAddonCart.totalPrice).toBe(200);
    expect(clearedAddonCart.tickets[0].selectedAddonContentfulId).toBeNull();
    expect(clearedAddonCart.tickets[0].addonQuantity).toBe(0);
  });
});
