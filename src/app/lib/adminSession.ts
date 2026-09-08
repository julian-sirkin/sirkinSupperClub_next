/**
 * Admin session cookie: a signed expiry stamp rather than a bare "true" flag.
 *
 * Uses Web Crypto rather than node:crypto because the middleware that checks
 * this runs on the Edge runtime, where node:crypto is unavailable.
 */

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

/** Used when ADMIN_VERIFIED_COOKIE is unset so the gate never silently opens. */
const FALLBACK_COOKIE_NAME = "sirkin_admin_session";

const encoder = new TextEncoder();

export const adminSessionMaxAgeSeconds = THIRTY_DAYS_IN_SECONDS;

export const getAdminCookieName = (): string =>
  process.env.ADMIN_VERIFIED_COOKIE || FALLBACK_COOKIE_NAME;

/**
 * Falls back to the admin password so this works without a new env var on
 * deploy. Rotating the password then also invalidates existing sessions.
 */
const getSigningSecret = (): string | null =>
  process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null;

const importKey = (secret: string): Promise<CryptoKey> =>
  crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);

const toBase64Url = (signature: ArrayBuffer): string => {
  const bytes = new Uint8Array(signature);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};

const fromBase64Url = (value: string): Uint8Array => {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

  return Uint8Array.from(atob(padded), character => character.charCodeAt(0));
};

/** Null when no secret is configured, which leaves the caller unable to log in. */
export const createAdminSessionToken = async (
  nowMs: number = Date.now()
): Promise<string | null> => {
  const secret = getSigningSecret();

  if (!secret) {
    console.warn("No ADMIN_SESSION_SECRET or ADMIN_PASSWORD set, cannot issue an admin session");
    return null;
  }

  const payload = String(nowMs + adminSessionMaxAgeSeconds * 1000);
  const key = await importKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));

  return `${payload}.${toBase64Url(signature)}`;
};

export const verifyAdminSessionToken = async (
  token: string | undefined | null,
  nowMs: number = Date.now()
): Promise<boolean> => {
  const secret = getSigningSecret();

  if (!secret || !token) {
    return false;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return false;
  }

  const expiresAt = Number(payload);

  if (!Number.isSafeInteger(expiresAt) || expiresAt <= nowMs) {
    return false;
  }

  try {
    const key = await importKey(secret);

    return await crypto.subtle.verify("HMAC", key, fromBase64Url(signature), encoder.encode(payload));
  } catch {
    return false;
  }
};

export const adminSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: adminSessionMaxAgeSeconds,
} as const;
