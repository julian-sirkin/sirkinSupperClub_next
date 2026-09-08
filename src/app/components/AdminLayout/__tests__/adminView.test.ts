import { buildAdminUrl, resolveAdminView, sectionKeepsSelectedId } from "../adminView";

describe("resolveAdminView", () => {
  it("opens a customer from the customer view", () => {
    expect(resolveAdminView("customer", "12")).toEqual({
      activeSection: "customers",
      eventSelected: null,
      customerSelected: 12,
    });
  });

  it("opens an event from the event view", () => {
    expect(resolveAdminView("event", "7")).toEqual({
      activeSection: "events",
      eventSelected: 7,
      customerSelected: null,
    });
  });

  it("opens the confirmation email editor", () => {
    expect(resolveAdminView("confirmation-email", null)).toEqual({
      activeSection: "confirmation-email",
      eventSelected: null,
      customerSelected: null,
    });
  });

  it("falls back to the events list when no view is given", () => {
    expect(resolveAdminView(null, null).activeSection).toBe("events");
  });

  it("falls back to the events list for an unrecognised view", () => {
    expect(resolveAdminView("nonsense", null).activeSection).toBe("events");
  });

  it("ignores an id that is not a positive integer", () => {
    expect(resolveAdminView("customer", "abc").customerSelected).toBeNull();
    expect(resolveAdminView("customer", "-3").customerSelected).toBeNull();
  });
});

describe("buildAdminUrl", () => {
  it("sets the view param and the selected id", () => {
    const url = buildAdminUrl({
      currentUrl: "https://example.com/admin",
      section: "customers",
      id: 12,
    });

    expect(url.searchParams.get("view")).toBe("customer");
    expect(url.searchParams.get("id")).toBe("12");
  });

  it("drops the view param for the default events section", () => {
    const url = buildAdminUrl({
      currentUrl: "https://example.com/admin?view=email",
      section: "events",
      id: 7,
    });

    expect(url.searchParams.has("view")).toBe(false);
    expect(url.searchParams.get("id")).toBe("7");
  });

  it("drops a stale id when the section addresses no record", () => {
    const url = buildAdminUrl({
      currentUrl: "https://example.com/admin?view=customer&id=12",
      section: "confirmation-email",
      id: null,
    });

    expect(url.searchParams.get("view")).toBe("confirmation-email");
    expect(url.searchParams.has("id")).toBe(false);
  });
});

describe("sectionKeepsSelectedId", () => {
  it("keeps the id for the sections that address a record", () => {
    expect(sectionKeepsSelectedId("events")).toBe(true);
    expect(sectionKeepsSelectedId("customers")).toBe(true);
  });

  it("does not keep an id for the email sections", () => {
    expect(sectionKeepsSelectedId("email")).toBe(false);
    expect(sectionKeepsSelectedId("confirmation-email")).toBe(false);
  });
});
