import { db } from "@/db";
import { customersTable, eventsTable, purchaseItemsTable, purchasesTable, ticketsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { transporter } from "@/app/config/nodemailer";
import { contentfulService } from "@/app/networkCalls/contentful/contentfulService";
import type { Document } from "@contentful/rich-text-types";
import { wrapEmailContent } from "@/app/utils/emailTemplate";

const ADMIN_EMAIL = "sirkinsupperclub@gmail.com";
const SITE_BASE_URL = "https://sirkinsupperclub.com";
/** Gmail allows up to ~500 recipients per message; batch only when above this. */
const BCC_BATCH_SIZE = 450;
const PREVIEW_UNSUBSCRIBE_URL = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(
  "Unsubscribe request"
)}`;

export type MarketingPhoto = {
  title: string;
  description?: string;
  url: string;
};

export type MarketingSocialLink = {
  url: string;
  label?: string;
};

type Recipient = {
  id: number;
  email: string;
};

export type MarketingAudience = "all_subscribed" | "exclude_event_ticket_holders";

export type MarketingRecipientStats = {
  totalSubscribed: number;
  excludedWithEventTickets: number;
  sendCount: number;
  audience: MarketingAudience;
};

export type MarketingCampaignSendResult = {
  recipientCount: number;
  batchesSent: number;
  audience: MarketingAudience;
  stats: MarketingRecipientStats;
};

export type MarketingComposeInput = {
  eventId: number;
  subject: string;
  preMenuSummary?: string;
  content: string;
  signOff: string;
  tiktokLinks: MarketingSocialLink[];
  selectedPhotos: MarketingPhoto[];
  audience?: MarketingAudience;
};

type EventMarketingContext = {
  eventId: number;
  eventTitle: string;
  eventDate: number | null;
  eventUrl: string;
  menuText: string;
  menuHighlights: string[];
  descriptionText: string;
  optionalPairings: string[];
  totalTicketsAvailable: number;
  totalTicketsSold: number;
  ticketsRemaining: number;
  ticketMomentumText: string;
};

function normalizeLinks(links: MarketingSocialLink[]): MarketingSocialLink[] {
  return links
    .map((entry) => ({
      url: entry.url.trim(),
      label: entry.label?.trim() ?? "",
    }))
    .filter((entry) => entry.url.length > 0)
    .map((entry) => {
      if (entry.url.startsWith("http://") || entry.url.startsWith("https://")) {
        return entry;
      }
      return { ...entry, url: `https://${entry.url}` };
    });
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDateString(dateValue: number | null): string {
  if (!dateValue) {
    return "Date coming soon";
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Date coming soon";
  }

  return parsedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function buildTicketMomentumText(totalSold: number, ticketsRemaining: number): string {
  if (totalSold <= 0 && ticketsRemaining <= 0) {
    return "Tickets are limited and moving quickly.";
  }

  if (totalSold <= 0) {
    return `${ticketsRemaining} seats currently available.`;
  }

  if (ticketsRemaining <= 0) {
    return `${totalSold} tickets have already been claimed.`;
  }

  return `${totalSold} tickets already claimed, ${ticketsRemaining} seats left.`;
}

function getMenuHighlights(menuText: string, maxItems = 3): string[] {
  if (!menuText.trim()) {
    return [];
  }

  const normalizedLines = menuText
    .split("\n")
    .map((line) => line.replace(/^[-*\u2022]\s*/, "").trim())
    .filter((line) => line.length > 0)
    .filter((line) => !/^menu$/i.test(line));

  return normalizedLines.slice(0, maxItems);
}

function richTextToPlainText(document: Document | undefined): string {
  if (!document) {
    return "";
  }

  const walk = (node: unknown): string => {
    if (!node || typeof node !== "object") {
      return "";
    }

    const typedNode = node as {
      nodeType?: string;
      value?: string;
      content?: unknown[];
    };

    if (typedNode.nodeType === "text") {
      return typedNode.value ?? "";
    }

    const children = Array.isArray(typedNode.content)
      ? typedNode.content.map((child) => walk(child)).join("")
      : "";

    if (typedNode.nodeType === "paragraph") {
      return `${children}\n\n`;
    }

    if (typedNode.nodeType === "list-item") {
      return `- ${children}\n`;
    }

    if (
      typedNode.nodeType === "heading-1" ||
      typedNode.nodeType === "heading-2" ||
      typedNode.nodeType === "heading-3"
    ) {
      return `${children}\n\n`;
    }

    return children;
  };

  return walk(document).replace(/\n{3,}/g, "\n\n").trim();
}

async function getEventMarketingContext(eventId: number): Promise<EventMarketingContext> {
  const eventRows = await db
    .select({
      id: eventsTable.id,
      title: eventsTable.title,
      date: eventsTable.date,
      contentfulId: eventsTable.contentfulId,
    })
    .from(eventsTable)
    .where(eq(eventsTable.id, eventId));

  const event = eventRows[0];
  if (!event) {
    throw new Error("Event not found");
  }

  const ticketRows = await db
    .select({
      totalAvailable: ticketsTable.totalAvailable,
      totalSold: ticketsTable.totalSold,
    })
    .from(ticketsTable)
    .where(eq(ticketsTable.event, eventId));

  const totalTicketsAvailable = ticketRows.reduce(
    (sum, ticket) => sum + (ticket.totalAvailable ?? 0),
    0
  );
  const totalTicketsSold = ticketRows.reduce((sum, ticket) => sum + (ticket.totalSold ?? 0), 0);
  const ticketsRemaining = Math.max(totalTicketsAvailable - totalTicketsSold, 0);
  const ticketMomentumText = buildTicketMomentumText(totalTicketsSold, ticketsRemaining);

  const fallbackContext: EventMarketingContext = {
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.date ? Number(event.date) : null,
    eventUrl: `${SITE_BASE_URL}/events/${encodeURIComponent(event.title)}`,
    menuText: "",
    menuHighlights: [],
    descriptionText: "",
    optionalPairings: [],
    totalTicketsAvailable,
    totalTicketsSold,
    ticketsRemaining,
    ticketMomentumText,
  };

  try {
    const { getEventsWithoutDB } = contentfulService();
    const contentfulEvents = await getEventsWithoutDB();
    const matchingEvent = contentfulEvents.find(
      (item) => item.contentfulEventId === event.contentfulId
    );

    if (!matchingEvent) {
      return fallbackContext;
    }

    const optionalPairings = Array.from(
      new Set(
        matchingEvent.tickets
          .flatMap((ticket) => ticket.addons.map((addon) => addon.title))
          .filter((title) => title.trim().length > 0)
      )
    );

    const menuText = richTextToPlainText(matchingEvent.menu);

    return {
      ...fallbackContext,
      menuText,
      menuHighlights: getMenuHighlights(menuText),
      descriptionText: richTextToPlainText(matchingEvent.longDescription),
      optionalPairings,
    };
  } catch (error) {
    console.error("Could not load Contentful context for event email:", error);
    return fallbackContext;
  }
}

function buildEventHighlightsSection(context: EventMarketingContext): string {
  const pairingSnippet =
    context.optionalPairings.length > 0
      ? ` You may also see optional pairings like ${escapeHtml(context.optionalPairings.join(", "))}.`
      : "";

  return `
    <section style="margin:20px 0;padding:16px;border:1px solid #B4945F;border-radius:8px;">
      <h2 style="margin:0 0 8px 0;color:#B4945F;font-size:24px;">${escapeHtml(context.eventTitle)}</h2>
      <p style="margin:0;color:#ffffff;line-height:1.7;">
        A new secret dinner is coming together, and this one is built to feel intimate, warm, and a little surprising.${pairingSnippet}
      </p>
    </section>
  `;
}

function buildMenuSection(context: EventMarketingContext): string {
  if (!context.menuText) {
    return "";
  }

  return `
    <section style="margin:20px 0;padding:16px;border:1px solid #333333;border-radius:8px;background:#0B0B0B;">
      <h3 style="margin:0 0 8px 0;color:#B4945F;font-size:20px;">Menu</h3>
      <pre style="margin:0;white-space:pre-wrap;font-family:Arial,sans-serif;color:#ffffff;line-height:1.6;">${escapeHtml(context.menuText)}</pre>
    </section>
  `;
}

function buildMediaSection(photos: MarketingPhoto[], tiktokLinks: MarketingSocialLink[]): string {
  const validPhotos = photos.filter((photo) => photo.url.trim().length > 0);
  const validTikTokLinks = normalizeLinks(tiktokLinks).filter((link) =>
    link.url.toLowerCase().includes("tiktok.com")
  );

  if (validPhotos.length === 0 && validTikTokLinks.length === 0) {
    return "";
  }

  const photosMarkup = validPhotos
    .map(
      (photo) => `
        <div style="margin-bottom:14px;">
          <img src="${photo.url}" alt="${escapeHtml(photo.title)}" style="display:block;width:100%;max-width:420px;height:auto;border-radius:8px;border:1px solid #444444;margin:0 auto;" />
          <p style="margin:6px 0 0 0;color:#cccccc;font-size:13px;">${escapeHtml(photo.title)}</p>
        </div>
      `
    )
    .join("");

  const tikTokMarkup = validTikTokLinks
    .map(
      (link) => `
        <li style="margin-bottom:8px;">
          <a href="${link.url}" style="color:#B4945F;text-decoration:underline;">${escapeHtml(
            link.label?.length ? link.label : link.url
          )}</a>
        </li>
      `
    )
    .join("");

  return `
    <section style="margin:20px 0;padding:16px;border:1px solid #333333;border-radius:8px;background:#0B0B0B;">
      <h3 style="margin:0 0 8px 0;color:#B4945F;font-size:20px;">Photos and Videos</h3>
      ${photosMarkup}
      ${
        tikTokMarkup
          ? `<div style="margin-top:10px;">
               <p style="margin:0 0 8px 0;color:#ffffff;font-weight:bold;">TikTok Links</p>
               <ul style="margin:0;padding-left:20px;">${tikTokMarkup}</ul>
             </div>`
          : ""
      }
    </section>
  `;
}

function buildEventCtaSection(context: EventMarketingContext): string {
  return `
    <section style="margin:20px 0;padding:16px;border:1px solid #B4945F;border-radius:8px;text-align:center;">
      <p style="margin:0 0 10px 0;color:#ffffff;line-height:1.6;">
        Ready to reserve your seat?
      </p>
      <a href="${context.eventUrl}" style="display:inline-block;background:#B4945F;color:#000000;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:bold;">
        View Event and Buy Tickets
      </a>
    </section>
  `;
}

function withParagraphSpacing(html: string): string {
  return html.replace(/<p([^>]*)>/gi, (fullMatch, attrs: string) => {
    if (/style=/.test(attrs)) {
      return fullMatch.replace(/style=(["'])(.*?)\1/i, (_styleMatch, quote: string, styleValue: string) => {
        const withLineHeight = /line-height\s*:/.test(styleValue)
          ? styleValue
          : `${styleValue};line-height:1.7`;
        const withMarginBottom = /margin-bottom\s*:/.test(withLineHeight)
          ? withLineHeight
          : `${withLineHeight};margin-bottom:14px`;
        return `style=${quote}${withMarginBottom}${quote}`;
      });
    }

    return `<p style="margin:0 0 14px 0;line-height:1.7;"${attrs}>`;
  });
}

function buildFinalEmailHtml(context: EventMarketingContext, input: MarketingComposeInput): string {
  const preMenuSummary = input.preMenuSummary?.trim()
    ? `<section style="margin:20px 0;">${withParagraphSpacing(input.preMenuSummary)}</section>`
    : buildEventHighlightsSection(context);

  const mainBodyContent = withParagraphSpacing(input.content);

  const sections = [
    preMenuSummary,
    buildMenuSection(context),
    `<section style="margin:20px 0;">${mainBodyContent}</section>`,
    buildEventCtaSection(context),
    buildMediaSection(input.selectedPhotos, input.tiktokLinks),
  ]
    .filter((section) => section.trim().length > 0)
    .join("");

  return wrapEmailContent(sections, input.signOff, context.eventUrl);
}

function appendUnsubscribeFooter(content: string, unsubscribeUrl: string): string {
  const resolvedUnsubscribeUrl =
    unsubscribeUrl.trim().length > 0 ? unsubscribeUrl : PREVIEW_UNSUBSCRIBE_URL;

  return `
    <main style="background:#000000;color:#ffffff;font-family:Arial,sans-serif;padding:24px;">
      <section style="max-width:680px;margin:0 auto;border:1px solid #d4af37;border-radius:12px;padding:24px;background:#111111;">
        <div style="line-height:1.6;font-size:16px;">
          ${content}
        </div>
        <hr style="margin-top:24px;margin-bottom:12px;border:0;border-top:1px solid #d4af37;" />
        <p style="font-size:12px;color:#e7e7e7;margin:0;">
          If you no longer want these emails, <a href="${resolvedUnsubscribeUrl}" style="color:#d4af37;">unsubscribe</a>.
        </p>
      </section>
    </main>
  `;
}

function dedupeRecipients(rows: Array<{ id: number | null; email: string | null }>): Recipient[] {
  const dedupedByEmail = new Map<string, Recipient>();

  for (const row of rows) {
    if (row.id === null || !row.email) {
      continue;
    }

    const normalizedEmail = row.email.trim().toLowerCase();
    if (!dedupedByEmail.has(normalizedEmail)) {
      dedupedByEmail.set(normalizedEmail, { id: row.id, email: normalizedEmail });
    }
  }

  return Array.from(dedupedByEmail.values());
}

export async function getAllSubscribedRecipients(): Promise<Recipient[]> {
  const subscribedCustomers = await db
    .select({
      id: customersTable.id,
      email: customersTable.email,
    })
    .from(customersTable)
    .where(and(eq(customersTable.emailSubscribed, true)));

  return dedupeRecipients(subscribedCustomers);
}

export async function getCustomerIdsWithTicketsForEvent(eventId: number): Promise<Set<number>> {
  const customersWithTicket = await db
    .select({
      customerId: purchasesTable.customerId,
    })
    .from(purchasesTable)
    .innerJoin(purchaseItemsTable, eq(purchaseItemsTable.purchaseId, purchasesTable.id))
    .innerJoin(ticketsTable, eq(ticketsTable.id, purchaseItemsTable.ticketId))
    .where(eq(ticketsTable.event, eventId));

  return new Set(
    customersWithTicket
      .map((row) => row.customerId)
      .filter((customerId): customerId is number => customerId !== null)
  );
}

export async function getMarketingRecipientsWithoutEventTickets(
  eventId: number
): Promise<Recipient[]> {
  const subscribedCustomers = await getAllSubscribedRecipients();
  const excludedCustomerIds = await getCustomerIdsWithTicketsForEvent(eventId);

  return subscribedCustomers.filter((recipient) => !excludedCustomerIds.has(recipient.id));
}

export async function getMarketingRecipientStats(
  eventId: number,
  audience: MarketingAudience = "all_subscribed"
): Promise<MarketingRecipientStats> {
  const allSubscribed = await getAllSubscribedRecipients();
  const excludedWithEventTickets = await getCustomerIdsWithTicketsForEvent(eventId);
  const prospects = allSubscribed.filter(
    (recipient) => !excludedWithEventTickets.has(recipient.id)
  );

  const sendCount = audience === "exclude_event_ticket_holders" ? prospects.length : allSubscribed.length;

  return {
    totalSubscribed: allSubscribed.length,
    excludedWithEventTickets: excludedWithEventTickets.size,
    sendCount,
    audience,
  };
}

export async function resolveMarketingRecipients(
  eventId: number,
  audience: MarketingAudience = "all_subscribed"
): Promise<Recipient[]> {
  if (audience === "exclude_event_ticket_holders") {
    return getMarketingRecipientsWithoutEventTickets(eventId);
  }

  return getAllSubscribedRecipients();
}

function excludeAdminFromRecipients(recipients: Recipient[]): Recipient[] {
  return recipients.filter((recipient) => recipient.email !== ADMIN_EMAIL);
}

function chunkRecipients<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

export async function getMarketingRecipientCount(
  eventId: number,
  audience: MarketingAudience = "all_subscribed"
): Promise<number> {
  const stats = await getMarketingRecipientStats(eventId, audience);
  return stats.sendCount;
}

export async function buildMarketingPreview(input: MarketingComposeInput): Promise<{
  html: string;
  recipientCount: number;
  stats: MarketingRecipientStats;
}> {
  const context = await getEventMarketingContext(input.eventId);
  const audience = input.audience ?? "all_subscribed";
  const stats = await getMarketingRecipientStats(input.eventId, audience);
  const coreHtml = buildFinalEmailHtml(context, input);
  const html = appendUnsubscribeFooter(coreHtml, PREVIEW_UNSUBSCRIBE_URL);

  return { html, recipientCount: stats.sendCount, stats };
}

export async function sendMarketingTestEmail(input: MarketingComposeInput): Promise<void> {
  const context = await getEventMarketingContext(input.eventId);
  const coreHtml = buildFinalEmailHtml(context, input);
  const html = appendUnsubscribeFooter(coreHtml, PREVIEW_UNSUBSCRIBE_URL);

  await transporter.sendMail({
    from: process.env.GMAIL_FROM,
    to: ADMIN_EMAIL,
    subject: input.subject,
    html,
  });
}

export async function sendMarketingCampaign(
  input: MarketingComposeInput,
  requestOrigin: string
): Promise<MarketingCampaignSendResult> {
  const audience = input.audience ?? "all_subscribed";
  const stats = await getMarketingRecipientStats(input.eventId, audience);
  const recipients = excludeAdminFromRecipients(
    await resolveMarketingRecipients(input.eventId, audience)
  );

  console.log("[MarketingEmail] Campaign send starting", {
    eventId: input.eventId,
    audience,
    totalSubscribed: stats.totalSubscribed,
    excludedWithEventTickets: stats.excludedWithEventTickets,
    recipientCount: recipients.length,
    requestOrigin,
  });

  if (recipients.length === 0) {
    throw new Error("No subscribed recipients found for this campaign audience");
  }

  const context = await getEventMarketingContext(input.eventId);
  const html = buildFinalEmailHtml(context, input);
  const fallbackUnsubscribeUrl = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(
    "Unsubscribe request"
  )}`;
  const emailHtml = appendUnsubscribeFooter(html, fallbackUnsubscribeUrl);
  const bccBatches = chunkRecipients(recipients, BCC_BATCH_SIZE);

  console.log("[MarketingEmail] Sending in BCC batches", {
    batches: bccBatches.length,
    batchSize: BCC_BATCH_SIZE,
    adminInboxCopies: bccBatches.length,
  });

  for (let batchIndex = 0; batchIndex < bccBatches.length; batchIndex++) {
    const batch = bccBatches[batchIndex];
    const bccEmails = batch.map((recipient) => recipient.email);

    console.log("[MarketingEmail] Sending batch", {
      batchNumber: batchIndex + 1,
      batchTotal: bccBatches.length,
      recipientsInBatch: bccEmails.length,
      firstRecipient: bccEmails[0],
      lastRecipient: bccEmails[bccEmails.length - 1],
    });

    await transporter.sendMail({
      from: process.env.GMAIL_FROM,
      to: ADMIN_EMAIL,
      bcc: bccEmails,
      subject: input.subject,
      html: emailHtml,
    });
  }

  console.log("[MarketingEmail] Campaign send complete", {
    eventId: input.eventId,
    recipientCount: recipients.length,
    batchesSent: bccBatches.length,
  });

  return {
    recipientCount: recipients.length,
    batchesSent: bccBatches.length,
    audience,
    stats,
  };
}

export async function getMarketingEventContext(eventId: number): Promise<EventMarketingContext> {
  return getEventMarketingContext(eventId);
}
