import { isPresaleActive, validatePresaleAccess } from "../validatePresaleAccess";

describe("validatePresaleAccess", () => {
  const activePresaleConfig = {
    presaleEnabled: true,
    presalePassword: "secret123",
    presaleEndsAt: "2026-07-01T02:00:00-07:00",
  };

  it("passes when presale is active and password matches", () => {
    const result = validatePresaleAccess({
      config: activePresaleConfig,
      providedPassword: "secret123",
      now: new Date("2026-06-30T20:00:00-07:00"),
    });

    expect(result).toEqual({ isValid: true, errorMessage: null });
  });

  it("fails when presale is active and password is missing", () => {
    const result = validatePresaleAccess({
      config: activePresaleConfig,
      providedPassword: "",
      now: new Date("2026-06-30T20:00:00-07:00"),
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain("required");
  });

  it("fails when presale is active and password is incorrect", () => {
    const result = validatePresaleAccess({
      config: activePresaleConfig,
      providedPassword: "wrong-password",
      now: new Date("2026-06-30T20:00:00-07:00"),
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain("incorrect");
  });

  it("passes without password when presale is expired", () => {
    const result = validatePresaleAccess({
      config: activePresaleConfig,
      providedPassword: "",
      now: new Date("2026-07-01T02:00:01-07:00"),
    });

    expect(result).toEqual({ isValid: true, errorMessage: null });
  });

  it("passes without password when no presale is configured", () => {
    const result = validatePresaleAccess({
      config: { presaleEnabled: false, presaleEndsAt: null, presalePassword: null },
      now: new Date("2026-06-30T20:00:00-07:00"),
    });

    expect(result).toEqual({ isValid: true, errorMessage: null });
  });
});

describe("isPresaleActive", () => {
  it("returns false when presale end date is invalid", () => {
    const result = isPresaleActive(
      {
        presaleEnabled: true,
        presaleEndsAt: "not-a-date",
      },
      new Date("2026-06-30T20:00:00-07:00")
    );

    expect(result).toBe(false);
  });
});
