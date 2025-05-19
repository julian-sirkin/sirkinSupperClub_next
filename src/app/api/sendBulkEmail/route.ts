import { NextResponse } from 'next/server';
import { db } from '@/db';
import { customersTable, purchaseItemsTable, purchasesTable, SelectCustomer } from '@/db/schema';
import { transporter } from '@/app/config/nodemailer';
import { eq, and } from 'drizzle-orm';

const ADMIN_EMAIL = 'sirkinsupperclub@gmail.com';

export async function POST(request: Request) {
  try {
    const { subject, content, type, eventId, recipients } = await request.json();

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
    let emailRecipients: string[] = [];
    
    if (type === 'all') {
      const result = await db
        .select({ email: customersTable.email })
        .from(customersTable)
        .where(and(
          // Only select customers with non-null emails
          // SQLite doesn't have IS NOT NULL, so we use this pattern
          eq(customersTable.email, customersTable.email)
        ));
      emailRecipients = result.map(row => row.email as string);
    } else if (type === 'event' && eventId) {
      const result = await db
        .select({ email: customersTable.email })
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
          eq(customersTable.email, customersTable.email) // Ensure email is not null
        ));
      // Convert to array and remove duplicates
      emailRecipients = Array.from(new Set(result.map(row => row.email as string)));
    } else if (type === 'specific' && recipients && Array.isArray(recipients)) {
      // For sending to specific recipients
      emailRecipients = recipients;
    } else {
      return NextResponse.json(
        { error: 'Invalid email type or missing required parameters' },
        { status: 400 }
      );
    }

    if (emailRecipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients found' },
        { status: 400 }
      );
    }

    // Get the first recipient for the "To" field
    const [primaryRecipient, ...otherRecipients] = emailRecipients;
    
    // Add admin email to BCC list if not already included
    const bccList = [...otherRecipients];
    if (!bccList.includes(ADMIN_EMAIL)) {
      bccList.push(ADMIN_EMAIL);
    }

    // Send email with one primary recipient and others in BCC
    await transporter.sendMail({
      from: process.env.GMAIL_FROM,
      to: primaryRecipient,
      bcc: bccList,
      subject,
      html: content,
    });

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