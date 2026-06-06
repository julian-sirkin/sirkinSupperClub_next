import { TicketWithPurchases } from '@/app/api/api.types';
import { getAdminEvent } from '@/app/lib/apiClient';

export interface EventData {
  tickets: TicketWithPurchases[];
  title: string;
  date: number | null;
  recipientEmails: string[];
}

export type MarketingPhoto = {
  title: string;
  description?: string;
  url: string;
};

export type MarketingSocialLink = {
  url: string;
  label?: string;
};

export type MarketingAudience = 'all_subscribed' | 'exclude_event_ticket_holders';

export type MarketingRecipientStats = {
  totalSubscribed: number;
  excludedWithEventTickets: number;
  sendCount: number;
  audience: MarketingAudience;
};

export type MarketingEmailPayload = {
  eventId: number;
  subject: string;
  preMenuSummary?: string;
  content: string;
  signOff: string;
  tiktokLinks: MarketingSocialLink[];
  selectedPhotos: MarketingPhoto[];
  audience?: MarketingAudience;
};

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

async function requestMarketingEmailAction<T>(
  action: 'recipientCount' | 'preview' | 'test' | 'send',
  payload: Partial<MarketingEmailPayload> & { eventId: number }
): Promise<T> {
  const response = await fetch('/api/eventMarketingEmail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      ...payload,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const errorMessage =
      typeof errorPayload?.error === 'string' ? errorPayload.error : 'Event marketing email request failed';
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

export async function getEventMarketingRecipientStats(
  eventId: number,
  audience: MarketingAudience = 'all_subscribed'
): Promise<MarketingRecipientStats> {
  const result = await requestMarketingEmailAction<{
    recipientCount: number;
    stats: MarketingRecipientStats;
  }>('recipientCount', {
    eventId,
    audience,
  });

  return result.stats;
}

export async function previewEventMarketingEmail(payload: MarketingEmailPayload): Promise<{
  html: string;
  recipientCount: number;
  stats: MarketingRecipientStats;
}> {
  return requestMarketingEmailAction<{
    html: string;
    recipientCount: number;
    stats: MarketingRecipientStats;
  }>('preview', payload);
}

export async function sendEventMarketingTestEmail(payload: MarketingEmailPayload): Promise<void> {
  await requestMarketingEmailAction<{ message: string }>('test', payload);
}

export async function sendEventMarketingCampaign(payload: MarketingEmailPayload): Promise<{
  recipientCount: number;
  batchesSent: number;
  stats: MarketingRecipientStats;
}> {
  return requestMarketingEmailAction<{
    message: string;
    recipientCount: number;
    batchesSent: number;
    stats: MarketingRecipientStats;
  }>('send', payload);
}

export async function generateEventMarketingAIDraft(eventId: number): Promise<{
  subject: string;
  preMenuSummary: string;
  content: string;
  usedFallback: boolean;
}> {
  return generateEventMarketingAIDraftWithContext({ eventId });
}

export async function generateEventMarketingAIDraftWithContext({
  eventId,
  generationNotes,
}: {
  eventId: number;
  generationNotes?: string;
}): Promise<{
  subject: string;
  preMenuSummary: string;
  content: string;
  usedFallback: boolean;
}> {
  const response = await fetch('/api/eventMarketingEmail/aiDraft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventId,
      generationNotes: generationNotes?.trim() || undefined,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const errorMessage =
      typeof errorPayload?.error === 'string' ? errorPayload.error : 'Failed to generate AI draft';
    throw new Error(errorMessage);
  }

  return (await response.json()) as {
    subject: string;
    preMenuSummary: string;
    content: string;
    usedFallback: boolean;
  };
}

export async function fetchContentfulPhotos(): Promise<MarketingPhoto[]> {
  const response = await fetch('/api/contentful/photos');
  if (!response.ok) {
    throw new Error('Failed to load Contentful photos');
  }

  const payload = (await response.json()) as { photos?: MarketingPhoto[] };
  return Array.isArray(payload.photos) ? payload.photos : [];
}