import { CartTicketType } from "@/store/cartStore.types";

type AddonLink = {
  ticketContentfulId: string;
  addonContentfulId: string;
};

type ValidateAddonSelectionsForPurchaseProps = {
  ticketsInRequest: CartTicketType[];
  addonLinks: AddonLink[];
};

export const validateAddonSelectionsForPurchase = ({
  ticketsInRequest,
  addonLinks,
}: ValidateAddonSelectionsForPurchaseProps) => {
  const errors: string[] = [];

  const allowedAddonsByTicketId = addonLinks.reduce<Record<string, Set<string>>>((acc, link) => {
    if (!acc[link.ticketContentfulId]) {
      acc[link.ticketContentfulId] = new Set<string>();
    }

    acc[link.ticketContentfulId].add(link.addonContentfulId);
    return acc;
  }, {});

  for (const ticket of ticketsInRequest) {
    const addonQuantity = Number(ticket.addonQuantity ?? 0);
    const selectedAddonId = ticket.selectedAddonContentfulId ?? null;

    if (addonQuantity < 0) {
      errors.push(`Addon quantity cannot be negative for ticket ${ticket.contentfulTicketId}`);
      continue;
    }

    if (addonQuantity > ticket.quantity) {
      errors.push(`Addon quantity cannot exceed ticket quantity for ticket ${ticket.contentfulTicketId}`);
      continue;
    }

    if (addonQuantity === 0 && !selectedAddonId) {
      continue;
    }

    if (addonQuantity > 0 && !selectedAddonId) {
      errors.push(`Addon selection is required when addon quantity is set for ticket ${ticket.contentfulTicketId}`);
      continue;
    }

    if (addonQuantity === 0 && selectedAddonId) {
      continue;
    }

    const allowedAddons = allowedAddonsByTicketId[ticket.contentfulTicketId];

    if (!allowedAddons || !allowedAddons.has(selectedAddonId as string)) {
      errors.push(`Addon ${selectedAddonId} is not valid for ticket ${ticket.contentfulTicketId}`);
    }
  }

  return {
    areAddonSelectionsValid: errors.length === 0,
    addonSelectionErrors: errors,
  };
};
