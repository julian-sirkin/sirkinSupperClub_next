import { defaultOrderConfirmationTemplate } from "../orderConfirmationDefaults";
import { OrderTicket } from "../orderSummary";
import { renderOrderConfirmationEmail } from "../renderOrderConfirmationEmail";

const TIME_ZONE = "America/Los_Angeles";

const tickets: OrderTicket[] = [
  {
    title: "6pm Seating",
    time: new Date("2026-03-15T01:00:00.000Z"),
    quantity: 2,
    price: 100,
    selectedAddonContentfulId: "addon-1",
    selectedAddonTitle: "Wine Pairing",
    selectedAddonPrice: 25,
    addonQuantity: 2,
  },
];

const renderWithDefaults = (overrides: Partial<Parameters<typeof renderOrderConfirmationEmail>[0]["context"]> = {}) =>
  renderOrderConfirmationEmail({
    template: defaultOrderConfirmationTemplate,
    context: {
      customerName: "Jane Buyer",
      customerEmail: "jane@example.com",
      tickets,
      clientTimeZone: TIME_ZONE,
      ...overrides,
    },
  });

describe("renderOrderConfirmationEmail", () => {
  it("includes the guest's name and the email they registered with", () => {
    const { html } = renderWithDefaults();

    expect(html).toContain("Jane Buyer");
    expect(html).toContain("jane@example.com");
  });

  it("lists the tickets, add-ons, and the order total", () => {
    const { html } = renderWithDefaults();

    expect(html).toContain("6pm Seating");
    expect(html).toContain("Wine Pairing (x2)");
    expect(html).toContain("$250.00");
  });

  it("explains lateness in terms of other guests and notes that tipping is optional", () => {
    const { html } = renderWithDefaults();

    expect(html).toContain("I turn the table as a group");
    expect(html).toContain("a late start can mean other guests are impacted");
    expect(html).toContain("Tipping");
    expect(html).toContain("Purely optional, always appreciated");
    expect(html).not.toContain("missed course");
  });

  it("names the seating time so the guest knows when to arrive", () => {
    const { html } = renderWithDefaults();

    expect(html).toContain("6:00 PM");
  });

  it("uses the event date when one is provided instead of the seating time", () => {
    const { html } = renderWithDefaults({ eventDate: new Date("2026-03-20T01:00:00.000Z") });

    expect(html).toContain("Thursday, March 19, 2026");
  });

  it("falls back to the earliest seating when no event date is available", () => {
    const { html } = renderWithDefaults();

    expect(html).toContain("Saturday, March 14, 2026");
  });

  it("keeps the Venmo and contact links", () => {
    const { html } = renderWithDefaults();

    expect(html).toContain("https://venmo.com/julian-sirkin");
    expect(html).toContain("mailto:sirkinsupperclub@gmail.com");
  });

  it("resolves tokens in the subject line", () => {
    const { subject } = renderOrderConfirmationEmail({
      template: { ...defaultOrderConfirmationTemplate, subject: "Confirmed: {{ticketSummary}}" },
      context: {
        customerName: "Jane Buyer",
        customerEmail: "jane@example.com",
        tickets,
        clientTimeZone: TIME_ZONE,
      },
    });

    expect(subject).toBe("Confirmed: 2x 6pm Seating");
  });

  it("escapes guest-supplied values so a name cannot inject markup", () => {
    const { html } = renderWithDefaults({ customerName: "<script>alert(1)</script>" });

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("greets the guest generically when no name was captured", () => {
    const { html } = renderWithDefaults({ customerName: "" });

    expect(html).toContain("friend");
  });
});
