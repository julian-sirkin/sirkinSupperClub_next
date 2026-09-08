import {
  OrderTicket,
  buildSeatingTimesText,
  buildTicketSummaryText,
  formatEventDate,
  formatSeatingTime,
  getEarliestTicketTime,
  getOrderTotal,
  getTicketLineTotal,
} from "../orderSummary";

const TIME_ZONE = "America/Los_Angeles";

const createTicket = (overrides: Partial<OrderTicket> = {}): OrderTicket => ({
  title: "6pm Seating",
  time: new Date("2026-03-15T01:00:00.000Z"),
  quantity: 2,
  price: 100,
  ...overrides,
});

describe("getTicketLineTotal", () => {
  it("multiplies the ticket price by the number of seats", () => {
    expect(getTicketLineTotal(createTicket())).toBe(200);
  });

  it("adds the add-on cost when an add-on was selected", () => {
    const ticketWithAddon = createTicket({
      selectedAddonContentfulId: "addon-1",
      selectedAddonPrice: 25,
      addonQuantity: 2,
    });

    expect(getTicketLineTotal(ticketWithAddon)).toBe(250);
  });

  it("ignores an add-on selected with a quantity of zero", () => {
    const ticketWithEmptyAddon = createTicket({
      selectedAddonContentfulId: "addon-1",
      selectedAddonPrice: 25,
      addonQuantity: 0,
    });

    expect(getTicketLineTotal(ticketWithEmptyAddon)).toBe(200);
  });
});

describe("getOrderTotal", () => {
  it("sums every line in the order", () => {
    const tickets = [
      createTicket({ quantity: 2, price: 100 }),
      createTicket({ title: "8pm Seating", quantity: 1, price: 120 }),
    ];

    expect(getOrderTotal(tickets)).toBe(320);
  });

  it("returns zero for an empty order", () => {
    expect(getOrderTotal([])).toBe(0);
  });
});

describe("date formatting", () => {
  it("formats a seating time in the guest's time zone", () => {
    expect(formatSeatingTime(new Date("2026-03-15T01:00:00.000Z"), TIME_ZONE)).toBe("6:00 PM");
  });

  it("formats the event date with the weekday spelled out", () => {
    expect(formatEventDate(new Date("2026-03-15T01:00:00.000Z"), TIME_ZONE)).toBe(
      "Saturday, March 14, 2026"
    );
  });

  it("falls back to the raw value rather than printing Invalid Date", () => {
    expect(formatSeatingTime("not a date", TIME_ZONE)).toBe("not a date");
  });

  it("falls back to the server time zone when the client sends an unusable one", () => {
    expect(() => formatSeatingTime(new Date("2026-03-15T01:00:00.000Z"), "Nowhere/Fake")).not.toThrow();
  });
});

describe("getEarliestTicketTime", () => {
  it("returns the first seating so it can stand in for the event date", () => {
    const tickets = [
      createTicket({ time: new Date("2026-03-15T03:00:00.000Z") }),
      createTicket({ time: new Date("2026-03-15T01:00:00.000Z") }),
    ];

    expect(getEarliestTicketTime(tickets)).toEqual(new Date("2026-03-15T01:00:00.000Z"));
  });

  it("returns null when no ticket has a usable time", () => {
    expect(getEarliestTicketTime([createTicket({ time: "not a date" })])).toBeNull();
  });
});

describe("summary text", () => {
  it("lists each ticket with its quantity", () => {
    const tickets = [
      createTicket({ quantity: 2, title: "6pm Seating" }),
      createTicket({ quantity: 1, title: "8pm Seating" }),
    ];

    expect(buildTicketSummaryText(tickets)).toBe("2x 6pm Seating, 1x 8pm Seating");
  });

  it("lists seating times without repeating a shared time", () => {
    const tickets = [
      createTicket({ time: new Date("2026-03-15T01:00:00.000Z") }),
      createTicket({ time: new Date("2026-03-15T01:00:00.000Z") }),
      createTicket({ time: new Date("2026-03-15T03:00:00.000Z") }),
    ];

    expect(buildSeatingTimesText(tickets, TIME_ZONE)).toBe("6:00 PM, 8:00 PM");
  });
});
