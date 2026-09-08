import { getAdminCookieName, verifyAdminSessionToken } from "@/app/lib/adminSession";
import { parse } from "cookie";

/**
 * The single admin gate, shared by the middleware that guards /admin pages and
 * by API routes, which the middleware matcher does not cover.
 *
 * Fails closed: an unsigned, expired, or missing cookie is not an admin.
 */
export const isAdminRequest = async (request: Request): Promise<boolean> => {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return false;
  }

  const cookies = parse(cookieHeader);

  return verifyAdminSessionToken(cookies[getAdminCookieName()]);
};
