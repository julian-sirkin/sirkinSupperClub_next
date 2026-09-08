import { getAdminPath, isAdminNavActive, resolveAdminView } from "../adminView";

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

describe("getAdminPath", () => {
  it("builds nested paths for selected records", () => {
    expect(
      getAdminPath({
        activeSection: "customers",
        eventSelected: null,
        customerSelected: 12,
      })
    ).toBe("/admin/customers/12");

    expect(
      getAdminPath({
        activeSection: "events",
        eventSelected: 7,
        customerSelected: null,
      })
    ).toBe("/admin/events/7");
  });

  it("maps the old email views onto their own routes", () => {
    expect(
      getAdminPath({
        activeSection: "email",
        eventSelected: null,
        customerSelected: null,
      })
    ).toBe("/admin/email");

    expect(
      getAdminPath({
        activeSection: "test-email",
        eventSelected: null,
        customerSelected: null,
      })
    ).toBe("/admin/send-email");

    expect(
      getAdminPath({
        activeSection: "confirmation-email",
        eventSelected: null,
        customerSelected: null,
      })
    ).toBe("/admin/confirmation-email");
  });
});

describe("isAdminNavActive", () => {
  it("treats a detail page as part of its section", () => {
    expect(isAdminNavActive("/admin/events/7", "/admin/events")).toBe(true);
    expect(isAdminNavActive("/admin/customers", "/admin/events")).toBe(false);
  });
});
