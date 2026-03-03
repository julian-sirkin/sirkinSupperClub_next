import crypto from 'crypto';

const UNSUBSCRIBE_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 365; // 1 year

type UnsubscribeTokenPayload = {
  customerId: number;
  email: string;
  exp: number;
};

function getUnsubscribeSecret(): string {
  const secret =
    process.env.UNSUBSCRIBE_TOKEN_SECRET ??
    process.env.ADMIN_VERIFIED_COOKIE ??
    process.env.ADMIN_PASSWORD;

  if (!secret) {
    throw new Error('Missing unsubscribe token secret');
  }

  return secret;
}

function signPayload(encodedPayload: string): string {
  return crypto
    .createHmac('sha256', getUnsubscribeSecret())
    .update(encodedPayload)
    .digest('hex');
}

export function createUnsubscribeToken(customerId: number, email: string): string {
  const payload: UnsubscribeTokenPayload = {
    customerId,
    email,
    exp: Date.now() + UNSUBSCRIBE_TOKEN_TTL_MS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyUnsubscribeToken(token: string): UnsubscribeTokenPayload | null {
  const [encodedPayload, providedSignature] = token.split('.');

  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  const providedBuffer = Buffer.from(providedSignature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsedPayload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as UnsubscribeTokenPayload;

    if (!parsedPayload.customerId || !parsedPayload.email || !parsedPayload.exp) {
      return null;
    }

    if (Date.now() > parsedPayload.exp) {
      return null;
    }

    return parsedPayload;
  } catch {
    return null;
  }
}
