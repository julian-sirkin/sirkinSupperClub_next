import { NextResponse } from 'next/server';
import { db } from '@/db';
import { customersTable, purchaseItemsTable, purchasesTable } from '@/db/schema';
import { transporter } from '@/app/config/nodemailer';
import { eq, and, inArray } from 'drizzle-orm';
import { createUnsubscribeToken } from '@/app/lib/unsubscribeToken';

const ADMIN_EMAIL = 'sirkinsupperclub@gmail.com';
const MAX_CONCURRENT_SENDS = 10;

type Recipient = {
  id: number;
  email: string;
};

function appendUnsubscribeFooter(content: string, unsubscribeUrl: string): string {
  return `
    <main style="background:#000000;color:#ffffff;font-family:Arial,sans-serif;padding:24px;">
      <section style="max-width:680px;margin:0 auto;border:1px solid #d4af37;border-radius:12px;padding:24px;background:#111111;">
        <h1 style="margin:0 0 16px 0;color:#d4af37;font-size:28px;">Sirkin Supper Club</h1>
        <div style="line-height:1.6;font-size:16px;">
          ${content}
        </div>
        <hr style="margin-top:24px;margin-bottom:12px;border:0;border-top:1px solid #d4af37;" />
        <p style="font-size:12px;color:#e7e7e7;margin:0;">
          If you no longer want these emails, <a href="${unsubscribeUrl}" style="color:#d4af37;">unsubscribe</a>.
        </p>
      </section>
    </main>
  `;
}

async function sendEmailsInBatches(tasks: Array<() => Promise<void>>) {
  for (let index = 0; index < tasks.length; index += MAX_CONCURRENT_SENDS) {
    const chunk = tasks.slice(index, index + MAX_CONCURRENT_SENDS);
    const results = await Promise.allSettled(chunk.map((task) => task()));
    const failed = results.filter((result) => result.status === 'rejected');

    if (failed.length > 0) {
      throw new Error(`Failed to send ${failed.length} bulk emails`);
    }
  }
}

export async function POST(request: Request) {
  try {
    const { subject, content, type, eventId, recipients } = await request.json();
    const origin = new URL(request.url).origin;

    // For test emails, only send to the test email address
    if (type === 'test') {
      await transporter.sendMail({
        from: process.env.GMAIL_FROM,
        to: ADMIN_EMAIL,
        subject,
        html: content,
      });
      
      return NextResponse.json({ message: 'Test email sent successfully' });
    }

    // Get recipients based on type
    let emailRecipients: Recipient[] = [];
    
    if (type === 'all') {
      const result = await db
        .select({ id: customersTable.id, email: customersTable.email })
        .from(customersTable)
        .where(eq(customersTable.emailSubscribed, true));
      emailRecipients = result
        .filter((row): row is Recipient => row.id !== null && !!row.email)
        .map((row) => ({ id: row.id, email: row.email }));
    } else if (type === 'event' && eventId) {
      const result = await db
        .select({ id: customersTable.id, email: customersTable.email })
        .from(customersTable)
        .innerJoin(
          purchasesTable,
          eq(purchasesTable.customerId, customersTable.id)
        )
        .innerJoin(
          purchaseItemsTable,
          eq(purchaseItemsTable.purchaseId, purchasesTable.id)
        )
        .where(and(
          eq(purchaseItemsTable.ticketId, eventId),
          eq(customersTable.emailSubscribed, true)
        ));
      // Remove duplicate rows by email.
      const deduped = new Map<string, Recipient>();
      for (const row of result) {
        if (row.id !== null && row.email) {
          deduped.set(row.email, { id: row.id, email: row.email });
        }
      }
      emailRecipients = Array.from(deduped.values());
    } else if (type === 'specific' && recipients && Array.isArray(recipients)) {
      const normalizedRecipients = recipients
        .filter((value): value is string => typeof value === 'string')
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0);

      if (normalizedRecipients.length > 0) {
        const result = await db
          .select({ id: customersTable.id, email: customersTable.email })
          .from(customersTable)
          .where(
            and(
              inArray(customersTable.email, normalizedRecipients),
              eq(customersTable.emailSubscribed, true)
            )
          );

        emailRecipients = result
          .filter((row): row is Recipient => row.id !== null && !!row.email)
          .map((row) => ({ id: row.id, email: row.email }));
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid email type or missing required parameters' },
        { status: 400 }
      );
    }

    if (emailRecipients.length === 0) {
      return NextResponse.json(
        { error: 'No subscribed recipients found' },
        { status: 400 }
      );
    }

    const sendTasks = emailRecipients.map((recipient) => async () => {
      const unsubscribeToken = createUnsubscribeToken(recipient.id, recipient.email);
      const unsubscribeUrl = `${origin}/api/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;

      await transporter.sendMail({
        from: process.env.GMAIL_FROM,
        to: recipient.email,
        bcc: ADMIN_EMAIL,
        subject,
        html: appendUnsubscribeFooter(content, unsubscribeUrl),
      });
    });

    await sendEmailsInBatches(sendTasks);

    return NextResponse.json({ 
      message: 'Emails sent successfully',
      recipientCount: emailRecipients.length 
    });
  } catch (error) {
    console.error('Error sending bulk email:', error);
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    );
  }
} 