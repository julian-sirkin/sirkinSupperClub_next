/**
 * @jest-environment node
 */

import { createAdminSessionToken, getAdminCookieName } from "@/app/lib/adminSession";
import { isAdminRequest } from "../isAdminRequest";

const ORIGINAL_ENV = process.env;

const requestWithCookie = (cookieHeader?: string) =>
  new Request("https://example.com/admin", {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });

describe("isAdminRequest", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    process.env.ADMIN_PASSWORD = "test-password";
    process.env.ADMIN_VERIFIED_COOKIE = "admin_session";
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("accepts a request that carries a valid signed session cookie", async () => {
    const token = await createAdminSessionToken();
    const request = requestWithCookie(`${getAdminCookieName()}=${token}`);

    await expect(isAdminRequest(request)).resolves.toBe(true);
  });

  it("rejects a request with no cookies", async () => {
    await expect(isAdminRequest(requestWithCookie())).resolves.toBe(false);
  });

  it("rejects the previous unsigned true flag", async () => {
    const request = requestWithCookie(`${getAdminCookieName()}=true`);

    await expect(isAdminRequest(request)).resolves.toBe(false);
  });

  it("rejects a valid token stored under a different cookie name", async () => {
    const token = await createAdminSessionToken();
    const request = requestWithCookie(`other_cookie=${token}`);

    await expect(isAdminRequest(request)).resolves.toBe(false);
  });
});
