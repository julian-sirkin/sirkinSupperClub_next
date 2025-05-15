import { TicketWithPurchases } from '@/app/api/api.types';
import { getAdminEvent } from '@/app/lib/apiClient';

export interface EventData {
  tickets: TicketWithPurchases[];
  title: string;
  date: number | null;
  recipientEmails: string[];
}

export async function fetchEventData(eventId: number): Promise<EventData> {
  const fetchedEventData = await getAdminEvent(eventId);
  const decodedEventData = await fetchedEventData.json();

  if (!fetchedEventData.ok || !decodedEventData.data) {
    throw new Error(decodedEventData.message || "Failed to load event data");
  }

  // Extract unique emails from all tickets and their purchases
  const uniqueEmails = new Set<string>();
  decodedEventData.data.tickets.forEach((ticket: TicketWithPurchases) => {
    ticket.purchases.forEach(purchase => {
      if (purchase.customerEmail) {
        uniqueEmails.add(purchase.customerEmail);
      }
    });
  });

  return {
    tickets: decodedEventData.data.tickets || [],
    title: decodedEventData.data.title || "Event Details",
    date: decodedEventData.data.date || null,
    recipientEmails: Array.from(uniqueEmails)
  };
}

export async function sendEventEmail(recipientEmails: string[], subject: string, content: string): Promise<void> {
  const response = await fetch('/api/sendBulkEmail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject,
      content,
      type: 'specific',
      recipients: recipientEmails
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send email');
  }
} 