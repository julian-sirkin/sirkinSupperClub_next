import {
  clearAdminDataCache,
  getCachedCustomerDetails,
  getCachedCustomerList,
  getCachedEvent,
  invalidateCustomerCaches,
  invalidateEventCache,
  invalidateEventCacheByPurchaseId,
  patchCachedPurchasePaid,
  setCachedCustomerDetails,
  setCachedCustomerList,
  setCachedEvent,
} from '../adminDataCache';
import type { EventData } from '@/app/components/AdminEvent/services/eventService';

const makeEvent = (overrides?: Partial<EventData>): EventData => ({
  title: 'Friday supper',
  date: 1,
  recipientEmails: ['guest@example.com'],
  tickets: [
    {
      ticketId: 10,
      ticketTime: 1,
      totalAvailable: 8,
      totalSold: 2,
      purchases: [
        {
          purchaseId: 44,
          customerId: 7,
          customerName: 'Ada',
          customerEmail: 'ada@example.com',
          quantity: 2,
          paid: false,
          purchaseDate: 1,
          ticketId: 10,
        },
      ],
    },
  ],
  ...overrides,
});

describe('adminDataCache', () => {
  afterEach(() => {
    clearAdminDataCache();
  });

  it('stores and returns event data', () => {
    const event = makeEvent();
    setCachedEvent(3, event);

    expect(getCachedEvent(3)).toEqual(event);
    expect(getCachedEvent(99)).toBeUndefined();
  });

  it('invalidates a single event or every event', () => {
    setCachedEvent(1, makeEvent({ title: 'One' }));
    setCachedEvent(2, makeEvent({ title: 'Two' }));

    invalidateEventCache(1);
    expect(getCachedEvent(1)).toBeUndefined();
    expect(getCachedEvent(2)?.title).toBe('Two');

    invalidateEventCache();
    expect(getCachedEvent(2)).toBeUndefined();
  });

  it('invalidates the event that owns a purchase', () => {
    setCachedEvent(1, makeEvent());
    setCachedEvent(2, makeEvent({
      tickets: [{
        ticketId: 11,
        ticketTime: 1,
        totalAvailable: 8,
        totalSold: 1,
        purchases: [{
          purchaseId: 99,
          customerId: 8,
          customerName: 'Grace',
          customerEmail: 'grace@example.com',
          quantity: 1,
          paid: true,
          purchaseDate: 1,
          ticketId: 11,
        }],
      }],
    }));

    invalidateEventCacheByPurchaseId(44);

    expect(getCachedEvent(1)).toBeUndefined();
    expect(getCachedEvent(2)).toBeDefined();
  });

  it('patches paid status on cached events and customer details', () => {
    setCachedEvent(3, makeEvent());
    setCachedCustomerDetails(7, {
      id: 7,
      purchases: [{ purchaseId: 44, paid: false, quantity: 2 }],
    });

    patchCachedPurchasePaid(44, true);

    expect(getCachedEvent(3)?.tickets[0].purchases[0].paid).toBe(true);
    expect(getCachedCustomerDetails<{ purchases: Array<{ paid: boolean }> }>(7)?.purchases[0].paid).toBe(true);
  });

  it('stores and clears customer list and detail caches', () => {
    setCachedCustomerList([{ id: 1, name: 'Ada' }]);
    setCachedCustomerDetails(1, { id: 1, name: 'Ada' });

    expect(getCachedCustomerList()).toEqual([{ id: 1, name: 'Ada' }]);
    expect(getCachedCustomerDetails(1)).toEqual({ id: 1, name: 'Ada' });

    invalidateCustomerCaches();

    expect(getCachedCustomerList()).toBeUndefined();
    expect(getCachedCustomerDetails(1)).toBeUndefined();
  });
});
