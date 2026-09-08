import { applyEmailTokens, findUnknownTokens } from "../emailTokens";

describe("applyEmailTokens", () => {
  it("replaces every occurrence of a known token", () => {
    const result = applyEmailTokens("Hi {{customerName}}, welcome {{customerName}}", {
      customerName: "Jane",
    });

    expect(result).toBe("Hi Jane, welcome Jane");
  });

  it("tolerates whitespace inside the braces", () => {
    const result = applyEmailTokens("Total: {{  orderTotal  }}", { orderTotal: "$100.00" });

    expect(result).toBe("Total: $100.00");
  });

  it("leaves a token in place when no value is supplied so the mistake is visible", () => {
    const result = applyEmailTokens("Hi {{customerName}} on {{eventDate}}", {
      customerName: "Jane",
    });

    expect(result).toBe("Hi Jane on {{eventDate}}");
  });

  it("returns an empty string for empty input", () => {
    expect(applyEmailTokens("", { customerName: "Jane" })).toBe("");
  });
});

describe("findUnknownTokens", () => {
  it("reports only tokens the renderer cannot fill", () => {
    const unknownTokens = findUnknownTokens(
      "<p>{{customerName}} booked {{ticketSummary}} but {{guestCout}} and {{madeUp}}</p>"
    );

    expect(unknownTokens.sort()).toEqual(["guestCout", "madeUp"]);
  });

  it("returns an empty list when every token is supported", () => {
    expect(findUnknownTokens("{{customerName}} {{eventDate}} {{venmoLink}}")).toEqual([]);
  });
});
