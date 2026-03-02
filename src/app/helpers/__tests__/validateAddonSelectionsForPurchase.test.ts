import { validateAddonSelectionsForPurchase } from "../validateAddonSelectionsForPurchase";
import { CartTicketType } from "@/store/cartStore.types";

const baseTicket: Omit<CartTicketType, "contentfulTicketId" | "quantity"> = {
  eventContentfulId: "event-1",
  title: "Dinner Ticket",
  time: new Date("2026-04-01T18:00:00.000Z"),
  ticketsAvailable: 10,
  price: 100,
  isAddonTicket: false,
  addons: [],
};

const makeTicket = (overrides: Partial<CartTicketType>): CartTicketType => ({
  ...baseTicket,
  contentfulTicketId: "ticket-1",
  quantity: 1,
  ...overrides,
});

describe("validateAddonSelectionsForPurchase", () => {
  it("allows valid addon selection within ticket quantity", () => {
    const ticketsInRequest = [
      makeTicket({
        quantity: 3,
        selectedAddonContentfulId: "addon-1",
        addonQuantity: 2,
      }),
    ];

    const result = validateAddonSelectionsForPurchase({
      ticketsInRequest,
      addonLinks: [{ ticketContentfulId: "ticket-1", addonContentfulId: "addon-1" }],
    });

    expect(result.areAddonSelectionsValid).toBe(true);
    expect(result.addonSelectionErrors).toEqual([]);
  });

  it("rejects addon quantity greater than ticket quantity", () => {
    const ticketsInRequest = [
      makeTicket({
        quantity: 2,
        selectedAddonContentfulId: "addon-1",
        addonQuantity: 3,
      }),
    ];

    const result = validateAddonSelectionsForPurchase({
      ticketsInRequest,
      addonLinks: [{ ticketContentfulId: "ticket-1", addonContentfulId: "addon-1" }],
    });

    expect(result.areAddonSelectionsValid).toBe(false);
    expect(result.addonSelectionErrors[0]).toContain("cannot exceed ticket quantity");
  });

  it("rejects addon that is not linked to the selected ticket", () => {
    const ticketsInRequest = [
      makeTicket({
        quantity: 1,
        selectedAddonContentfulId: "addon-other",
        addonQuantity: 1,
      }),
    ];

    const result = validateAddonSelectionsForPurchase({
      ticketsInRequest,
      addonLinks: [{ ticketContentfulId: "ticket-1", addonContentfulId: "addon-1" }],
    });

    expect(result.areAddonSelectionsValid).toBe(false);
    expect(result.addonSelectionErrors[0]).toContain("not valid for ticket");
  });
});
