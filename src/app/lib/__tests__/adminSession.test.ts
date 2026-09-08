/**
 * @jest-environment node
 */

import {
  adminSessionCookieOptions,
  adminSessionMaxAgeSeconds,
  createAdminSessionToken,
  getAdminCookieName,
  verifyAdminSessionToken,
} from "../adminSession";

const ORIGINAL_ENV = process.env;

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const FIXED_NOW = Date.parse("2026-09-07T19:00:00Z");

describe("adminSession", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.ADMIN_VERIFIED_COOKIE;
    delete process.env.ADMIN_SESSION_SECRET;
    delete process.env.ADMIN_PASSWORD;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("falls back to a stable cookie name when the env var is unset", () => {
    expect(getAdminCookieName()).toBe("sirkin_admin_session");
  });

  it("uses ADMIN_VERIFIED_COOKIE as the cookie name when it is set", () => {
    process.env.ADMIN_VERIFIED_COOKIE = "custom_admin_flag";
    expect(getAdminCookieName()).toBe("custom_admin_flag");
  });

  it("issues a token that verifies within the 30-day window", async () => {
    process.env.ADMIN_PASSWORD = "test-password";

    const token = await createAdminSessionToken(FIXED_NOW);

    expect(token).toMatch(/^\d+\.[A-Za-z0-9_-]+$/);
    await expect(verifyAdminSessionToken(token, FIXED_NOW)).resolves.toBe(true);
    await expect(verifyAdminSessionToken(token, FIXED_NOW + THIRTY_DAYS_MS - 1)).resolves.toBe(true);
  });

  it("prefers ADMIN_SESSION_SECRET over ADMIN_PASSWORD for signing", async () => {
    process.env.ADMIN_SESSION_SECRET = "session-secret";
    process.env.ADMIN_PASSWORD = "password-secret";

    const token = await createAdminSessionToken(FIXED_NOW);

    process.env.ADMIN_SESSION_SECRET = "password-secret";
    await expect(verifyAdminSessionToken(token, FIXED_NOW)).resolves.toBe(false);

    process.env.ADMIN_SESSION_SECRET = "session-secret";
    await expect(verifyAdminSessionToken(token, FIXED_NOW)).resolves.toBe(true);
  });

  it("rejects an expired token", async () => {
    process.env.ADMIN_PASSWORD = "test-password";
    const token = await createAdminSessionToken(FIXED_NOW);

    await expect(verifyAdminSessionToken(token, FIXED_NOW + THIRTY_DAYS_MS)).resolves.toBe(false);
    await expect(verifyAdminSessionToken(token, FIXED_NOW + THIRTY_DAYS_MS + 1)).resolves.toBe(false);
  });

  it("rejects a tampered signature", async () => {
    process.env.ADMIN_PASSWORD = "test-password";
    const token = await createAdminSessionToken(FIXED_NOW);
    const [payload, signature] = token!.split(".");
    const flipped = signature.endsWith("A") ? `${signature.slice(0, -1)}B` : `${signature.slice(0, -1)}A`;

    await expect(verifyAdminSessionToken(`${payload}.${flipped}`, FIXED_NOW)).resolves.toBe(false);
  });

  it("rejects the old bare true flag that used to be the whole session", async () => {
    process.env.ADMIN_PASSWORD = "test-password";

    await expect(verifyAdminSessionToken("true", FIXED_NOW)).resolves.toBe(false);
  });

  it("rejects missing, empty, and malformed tokens", async () => {
    process.env.ADMIN_PASSWORD = "test-password";

    await expect(verifyAdminSessionToken(null, FIXED_NOW)).resolves.toBe(false);
    await expect(verifyAdminSessionToken(undefined, FIXED_NOW)).resolves.toBe(false);
    await expect(verifyAdminSessionToken("", FIXED_NOW)).resolves.toBe(false);
    await expect(verifyAdminSessionToken("not-a-token", FIXED_NOW)).resolves.toBe(false);
    await expect(verifyAdminSessionToken("12345.", FIXED_NOW)).resolves.toBe(false);
  });

  it("does not issue a token when no signing secret is configured", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);

    await expect(createAdminSessionToken(FIXED_NOW)).resolves.toBeNull();
    await expect(verifyAdminSessionToken("anything.goes", FIXED_NOW)).resolves.toBe(false);

    warn.mockRestore();
  });

  it("sets a 30-day httpOnly cookie that is Secure only in production", () => {
    expect(adminSessionMaxAgeSeconds).toBe(60 * 60 * 24 * 30);
    expect(adminSessionCookieOptions).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: adminSessionMaxAgeSeconds,
    });
    expect(adminSessionCookieOptions.secure).toBe(process.env.NODE_ENV === "production");
  });
});
