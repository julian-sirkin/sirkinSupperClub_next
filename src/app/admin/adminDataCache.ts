import type { EventData } from '@/app/components/AdminEvent/services/eventService';

const eventCache = new Map<number, EventData>();
const customerDetailCache = new Map<number, unknown>();
let customerListCache: unknown | null = null;

type PurchaseRecord = {
  purchaseId: number;
  paid: boolean;
};

function hasPurchases(value: unknown): value is { purchases: PurchaseRecord[] } {
  if (!value || typeof value !== 'object' || !('purchases' in value)) {
    return false;
  }

  return Array.isArray((value as { purchases: unknown }).purchases);
}

export function getCachedEvent(eventId: number): EventData | undefined {
  return eventCache.get(eventId);
}

export function setCachedEvent(eventId: number, data: EventData): void {
  eventCache.set(eventId, data);
}

export function invalidateEventCache(eventId?: number): void {
  if (typeof eventId === 'number') {
    eventCache.delete(eventId);
    return;
  }

  eventCache.clear();
}

export function invalidateEventCacheByPurchaseId(purchaseId: number): void {
  for (const [eventId, event] of eventCache.entries()) {
    const hasPurchase = event.tickets.some((ticket) =>
      ticket.purchases.some((purchase) => purchase.purchaseId === purchaseId)
    );

    if (hasPurchase) {
      eventCache.delete(eventId);
    }
  }
}

export function getCachedCustomerList<T>(): T | undefined {
  return customerListCache === null ? undefined : (customerListCache as T);
}

export function setCachedCustomerList<T>(customers: T): void {
  customerListCache = customers;
}

export function getCachedCustomerDetails<T>(customerId: number): T | undefined {
  return customerDetailCache.get(customerId) as T | undefined;
}

export function setCachedCustomerDetails<T>(customerId: number, details: T): void {
  customerDetailCache.set(customerId, details);
}

export function invalidateCustomerCaches(): void {
  customerListCache = null;
  customerDetailCache.clear();
}

export function patchCachedPurchasePaid(purchaseId: number, paid: boolean): void {
  for (const [eventId, event] of eventCache.entries()) {
    let found = false;
    const tickets = event.tickets.map((ticket) => ({
      ...ticket,
      purchases: ticket.purchases.map((purchase) => {
        if (purchase.purchaseId !== purchaseId) {
          return purchase;
        }

        found = true;
        return { ...purchase, paid };
      }),
    }));

    if (found) {
      eventCache.set(eventId, { ...event, tickets });
    }
  }

  for (const [customerId, customer] of customerDetailCache.entries()) {
    if (!hasPurchases(customer)) {
      continue;
    }

    let found = false;
    const purchases = customer.purchases.map((purchase) => {
      if (purchase.purchaseId !== purchaseId) {
        return purchase;
      }

      found = true;
      return { ...purchase, paid };
    });

    if (found) {
      customerDetailCache.set(customerId, { ...customer, purchases });
    }
  }
}

export function clearAdminDataCache(): void {
  eventCache.clear();
  customerListCache = null;
  customerDetailCache.clear();
}
