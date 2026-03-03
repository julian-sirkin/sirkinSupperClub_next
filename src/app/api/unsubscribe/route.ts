import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { customersTable } from '@/db/schema';
import { verifyUnsubscribeToken } from '@/app/lib/unsubscribeToken';

function htmlResponse(status: number, title: string, message: string) {
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="font-family:Arial,sans-serif;padding:24px;line-height:1.5;">
    <h1>${title}</h1>
    <p>${message}</p>
  </body>
</html>`;

  return new NextResponse(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const token = requestUrl.searchParams.get('token');

    if (!token) {
      return htmlResponse(400, 'Invalid unsubscribe link', 'The unsubscribe token is missing.');
    }

    const payload = verifyUnsubscribeToken(token);
    if (!payload) {
      return htmlResponse(400, 'Invalid unsubscribe link', 'This unsubscribe link is invalid or expired.');
    }

    await db
      .update(customersTable)
      .set({
        emailSubscribed: false,
        unsubscribedAt: new Date(),
      })
      .where(
        and(
          eq(customersTable.id, payload.customerId),
          eq(customersTable.email, payload.email)
        )
      );

    return htmlResponse(
      200,
      'You are unsubscribed',
      'You have been removed from bulk contact emails.'
    );
  } catch (error) {
    console.error('Error processing unsubscribe request:', error);
    return htmlResponse(
      500,
      'Something went wrong',
      'We could not process your unsubscribe request right now.'
    );
  }
}
