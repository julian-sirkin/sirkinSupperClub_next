import { OrderConfirmationContext } from "./renderOrderConfirmationEmail";

const DAYS_UNTIL_SAMPLE_EVENT = 21;
const SAMPLE_SEATING_HOUR = 18;

/** Stand-in order so the admin can see the confirmation exactly as a guest will. */
export const buildSampleOrderPreview = (now: Date = new Date()): OrderConfirmationContext => {
  const eventDate = new Date(now);
  eventDate.setDate(eventDate.getDate() + DAYS_UNTIL_SAMPLE_EVENT);
  eventDate.setHours(SAMPLE_SEATING_HOUR, 0, 0, 0);

  return {
    customerName: "Jane Guest",
    customerEmail: "jane@example.com",
    eventDate,
    tickets: [
      {
        title: `${SAMPLE_SEATING_HOUR % 12}pm Seating`,
        time: eventDate,
        quantity: 2,
        price: 95,
        selectedAddonContentfulId: "sample-addon",
        selectedAddonTitle: "Wine Pairing",
        selectedAddonPrice: 25,
        addonQuantity: 2,
      },
    ],
  };
};
