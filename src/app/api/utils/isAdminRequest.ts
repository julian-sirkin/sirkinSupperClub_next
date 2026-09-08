import { parse } from "cookie";

/**
 * Mirrors the cookie check the middleware applies to /admin pages. API routes
 * are not covered by that matcher, so any route that writes guest-facing
 * content has to check for itself.
 *
 * Fails closed when ADMIN_VERIFIED_COOKIE is unset rather than allowing the
 * write through unauthenticated.
 */
export const isAdminRequest = (request: Request): boolean => {
  const adminCookieName = process.env.ADMIN_VERIFIED_COOKIE;

  if (!adminCookieName) {
    console.warn("ADMIN_VERIFIED_COOKIE is not set, refusing the admin request");
    return false;
  }

  const cookieHeader = request.headers.get("cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};

  return cookies[adminCookieName] === "true";
};
