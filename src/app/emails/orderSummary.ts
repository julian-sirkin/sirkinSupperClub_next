import { CartTicketType } from "@/store/cartStore.types";

export type OrderTicket = Pick<
  CartTicketType,
  | "title"
  | "time"
  | "quantity"
  | "price"
  | "selectedAddonContentfulId"
  | "selectedAddonTitle"
  | "selectedAddonPrice"
  | "addonQuantity"
>;

const hasAddon = (ticket: OrderTicket) =>
  Boolean(ticket.selectedAddonContentfulId) && (ticket.addonQuantity ?? 0) > 0;

export const getTicketLineTotal = (ticket: OrderTicket): number => {
  const ticketTotal = ticket.price * ticket.quantity;
  const addonTotal = hasAddon(ticket)
    ? (ticket.selectedAddonPrice ?? 0) * (ticket.addonQuantity ?? 0)
    : 0;

  return ticketTotal + addonTotal;
};

export const getOrderTotal = (tickets: OrderTicket[]): number =>
  tickets.reduce((total, ticket) => total + getTicketLineTotal(ticket), 0);

const toValidDate = (value: string | Date): Date | null => {
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

/** `toLocaleString` throws on an invalid IANA zone, which would take down the whole confirmation email. */
const formatWithTimeZone = (
  date: Date,
  options: Intl.DateTimeFormatOptions,
  clientTimeZone?: string
) => {
  try {
    return date.toLocaleString("en-us", { ...options, timeZone: clientTimeZone });
  } catch {
    return date.toLocaleString("en-us", options);
  }
};

export const formatTicketDateTime = (
  ticketTime: string | Date,
  clientTimeZone?: string
): string => {
  const parsedTime = toValidDate(ticketTime);
  if (!parsedTime) {
    return String(ticketTime);
  }

  return formatWithTimeZone(
    parsedTime,
    { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" },
    clientTimeZone
  );
};

export const formatSeatingTime = (ticketTime: string | Date, clientTimeZone?: string): string => {
  const parsedTime = toValidDate(ticketTime);
  if (!parsedTime) {
    return String(ticketTime);
  }

  return formatWithTimeZone(parsedTime, { hour: "numeric", minute: "2-digit" }, clientTimeZone);
};

export const formatEventDate = (eventDate: string | Date, clientTimeZone?: string): string => {
  const parsedDate = toValidDate(eventDate);
  if (!parsedDate) {
    return String(eventDate);
  }

  return formatWithTimeZone(
    parsedDate,
    { weekday: "long", month: "long", day: "numeric", year: "numeric" },
    clientTimeZone
  );
};

/** The event date is not on the cart line items, so the earliest seating stands in for it. */
export const getEarliestTicketTime = (tickets: OrderTicket[]): Date | null => {
  const ticketTimes = tickets
    .map((ticket) => toValidDate(ticket.time))
    .filter((date): date is Date => date !== null);

  if (ticketTimes.length === 0) {
    return null;
  }

  return ticketTimes.reduce((earliest, current) => (current < earliest ? current : earliest));
};

export const buildTicketSummaryText = (tickets: OrderTicket[]): string =>
  tickets.map((ticket) => `${ticket.quantity}x ${ticket.title}`).join(", ");

export const buildSeatingTimesText = (
  tickets: OrderTicket[],
  clientTimeZone?: string
): string => {
  const uniqueSeatingTimes = Array.from(
    new Set(tickets.map((ticket) => formatSeatingTime(ticket.time, clientTimeZone)))
  );

  return uniqueSeatingTimes.join(", ");
};
