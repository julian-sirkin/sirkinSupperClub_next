import { buildEventRunOfShow, summarizeSeatingCounts } from "../buildEventRunOfShow";

const jane = {
  purchaseId: 1,
  customerId: 11,
  customerName: "Jane",
  customerEmail: "jane@example.com",
  customerPhone: "5551112222",
  quantity: 2,
  notes: "window if possible",
  dietaryRestrictions: "fish allergy",
  addonQuantity: 1,
  addonTitle: "Wine pairing",
};

const sam = {
  purchaseId: 2,
  customerId: 12,
  customerName: "Sam",
  customerEmail: "sam@example.com",
  customerPhone: null,
  quantity: 3,
  notes: null,
  dietaryRestrictions: null,
};

describe("buildEventRunOfShow", () => {
  it("groups parties by seating time and totals guests", () => {
    const runOfShow = buildEventRunOfShow({
      title: "Spring Dinner",
      date: "2026-04-12T00:00:00.000Z",
      tickets: [
        {
          ticketTime: "2026-04-12T03:00:00.000Z",
          purchases: [sam],
        },
        {
          ticketTime: "2026-04-12T01:45:00.000Z",
          purchases: [jane],
        },
      ],
    });

    expect(runOfShow.guestCount).toBe(5);
    expect(runOfShow.partyCount).toBe(2);
    expect(runOfShow.seatings.map(seating => seating.timeLabel)).toEqual([
      "6:45 PM",
      "8:00 PM",
    ]);
    expect(runOfShow.seatings[0]).toMatchObject({
      guestCount: 2,
      partyCount: 1,
    });
    expect(runOfShow.seatings[0].parties[0]).toMatchObject({
      customerName: "Jane",
      size: 2,
      dietaryRestrictions: "fish allergy",
      addonLabel: "Wine pairing ×1",
    });
    expect(runOfShow.seatings[1]).toMatchObject({
      guestCount: 3,
      partyCount: 1,
    });
  });

  it("counts a split checkout as one party for the event and separately at each seating", () => {
    const splitPurchase = {
      purchaseId: 9,
      customerId: 3,
      customerName: "Alex",
      customerEmail: "alex@example.com",
      quantity: 2,
    };

    const runOfShow = buildEventRunOfShow({
      title: "Dinner",
      date: null,
      tickets: [
        { ticketTime: "2026-04-12T01:45:00.000Z", purchases: [{ ...splitPurchase, quantity: 2 }] },
        { ticketTime: "2026-04-12T03:00:00.000Z", purchases: [{ ...splitPurchase, quantity: 1 }] },
      ],
    });

    expect(runOfShow.guestCount).toBe(3);
    expect(runOfShow.partyCount).toBe(1);
    expect(runOfShow.seatings[0].partyCount).toBe(1);
    expect(runOfShow.seatings[1].partyCount).toBe(1);
  });

  it("skips refunded lines and lists allergies first", () => {
    const runOfShow = buildEventRunOfShow({
      title: "Dinner",
      date: "2026-04-12T00:00:00.000Z",
      tickets: [
        {
          ticketTime: "2026-04-12T01:45:00.000Z",
          purchases: [
            { ...sam, purchaseId: 4, quantity: 0 },
            { ...sam, purchaseId: 5, customerName: "Sam" },
            jane,
          ],
        },
      ],
    });

    expect(runOfShow.seatings[0].parties.map(party => party.customerName)).toEqual([
      "Jane",
      "Sam",
    ]);
  });
});

describe("summarizeSeatingCounts", () => {
  it("matches the kitchen readout phrasing", () => {
    const runOfShow = buildEventRunOfShow({
      title: "Dinner",
      date: "2026-04-12T00:00:00.000Z",
      tickets: [
        {
          ticketTime: "2026-04-12T03:00:00.000Z",
          purchases: [jane, sam],
        },
      ],
    });

    expect(summarizeSeatingCounts(runOfShow.seatings[0])).toBe(
      "5 guests made up of 2 parties, a 2 and 3"
    );
  });
});
