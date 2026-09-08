import { pickEmailTemplate } from "../pickEmailTemplate";

const defaultTemplate = {
  subject: "Default subject",
  bodyHtml: "<p>Default body</p>",
  signOff: "Best,",
};

const globalTemplate = {
  subject: "Saved subject",
  bodyHtml: "<p>Saved body</p>",
  signOff: "Cheers,",
};

const eventTemplate = {
  subject: "Event subject",
  bodyHtml: "<p>Event body</p>",
  signOff: "See you soon,",
};

describe("pickEmailTemplate", () => {
  it("prefers the per-event override over everything else", () => {
    const resolved = pickEmailTemplate({ eventTemplate, globalTemplate, defaultTemplate });

    expect(resolved.subject).toBe("Event subject");
    expect(resolved.source).toBe("event");
  });

  it("uses the saved default when the event has no override", () => {
    const resolved = pickEmailTemplate({ globalTemplate, defaultTemplate });

    expect(resolved.subject).toBe("Saved subject");
    expect(resolved.source).toBe("global");
  });

  it("falls back to the copy in code so emails still send before anything is saved", () => {
    const resolved = pickEmailTemplate({ defaultTemplate });

    expect(resolved.subject).toBe("Default subject");
    expect(resolved.source).toBe("default");
  });

  it("treats a null override the same as no override", () => {
    const resolved = pickEmailTemplate({
      eventTemplate: null,
      globalTemplate: null,
      defaultTemplate,
    });

    expect(resolved.source).toBe("default");
  });
});
