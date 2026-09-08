import { formatEventDate, formatSeatingTime } from "@/app/emails/orderSummary";

export type RunOfShowPurchase = {
  purchaseId: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  quantity: number;
  notes?: string | null;
  dietaryRestrictions?: string | null;
  addonQuantity?: number;
  addonTitle?: string | null;
};

export type RunOfShowTicket = {
  ticketTime: string | Date | number | null;
  purchases: RunOfShowPurchase[];
};

export type RunOfShowParty = {
  purchaseId: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  size: number;
  notes: string | null;
  dietaryRestrictions: string | null;
  addonLabel: string | null;
};

export type RunOfShowSeating = {
  timeKey: number;
  timeLabel: string;
  guestCount: number;
  partyCount: number;
  parties: RunOfShowParty[];
};

export type EventRunOfShow = {
  title: string;
  dateLabel: string;
  guestCount: number;
  partyCount: number;
  seatings: RunOfShowSeating[];
};

const EVENT_TIME_ZONE = "America/Los_Angeles";

const toTimeKey = (ticketTime: RunOfShowTicket["ticketTime"]): number => {
  if (ticketTime === null || ticketTime === undefined) {
    return 0;
  }

  const parsed = new Date(ticketTime);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const optionalLabel = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const addonLabelFor = (purchase: RunOfShowPurchase): string | null => {
  const quantity = purchase.addonQuantity ?? 0;
  if (quantity <= 0) {
    return null;
  }

  return `${purchase.addonTitle ?? "Addon"} ×${quantity}`;
};

const compareParties = (left: RunOfShowParty, right: RunOfShowParty): number => {
  const leftHasDietary = Boolean(left.dietaryRestrictions);
  const rightHasDietary = Boolean(right.dietaryRestrictions);

  if (leftHasDietary !== rightHasDietary) {
    return leftHasDietary ? -1 : 1;
  }

  return left.customerName.localeCompare(right.customerName);
};

export const buildEventRunOfShow = ({
  title,
  date,
  tickets,
}: {
  title: string;
  date: string | Date | number | null;
  tickets: RunOfShowTicket[];
}): EventRunOfShow => {
  const seatingsByTime = new Map<number, RunOfShowSeating>();
  const uniquePurchaseIds = new Set<number>();
  let guestCount = 0;

  tickets.forEach(ticket => {
    const timeKey = toTimeKey(ticket.ticketTime);
    const timeLabel =
      timeKey === 0 ? "Time TBA" : formatSeatingTime(new Date(timeKey), EVENT_TIME_ZONE);

    const seating = seatingsByTime.get(timeKey) ?? {
      timeKey,
      timeLabel,
      guestCount: 0,
      partyCount: 0,
      parties: [],
    };

    ticket.purchases.forEach(purchase => {
      if (purchase.quantity <= 0) {
        return;
      }

      uniquePurchaseIds.add(purchase.purchaseId);
      guestCount += purchase.quantity;
      seating.guestCount += purchase.quantity;
      seating.parties.push({
        purchaseId: purchase.purchaseId,
        customerId: purchase.customerId,
        customerName: purchase.customerName || "Unknown guest",
        customerEmail: purchase.customerEmail,
        customerPhone: optionalLabel(purchase.customerPhone),
        size: purchase.quantity,
        notes: optionalLabel(purchase.notes),
        dietaryRestrictions: optionalLabel(purchase.dietaryRestrictions),
        addonLabel: addonLabelFor(purchase),
      });
    });

    seating.partyCount = seating.parties.length;
    seatingsByTime.set(timeKey, seating);
  });

  const seatings = Array.from(seatingsByTime.values())
    .filter(seating => seating.guestCount > 0)
    .sort((left, right) => left.timeKey - right.timeKey)
    .map(seating => ({
      ...seating,
      parties: [...seating.parties].sort(compareParties),
    }));

  return {
    title,
    dateLabel: date ? formatEventDate(new Date(date), EVENT_TIME_ZONE) : "Date TBA",
    guestCount,
    partyCount: uniquePurchaseIds.size,
    seatings,
  };
};

export const summarizeSeatingCounts = (seating: RunOfShowSeating): string => {
  const partySizes = seating.parties.map(party => party.size).join(" and ");
  const partyNoun = seating.partyCount === 1 ? "party" : "parties";

  if (seating.partyCount === 0) {
    return "0 guests";
  }

  return `${seating.guestCount} guests made up of ${seating.partyCount} ${partyNoun}, a ${partySizes}`;
};
