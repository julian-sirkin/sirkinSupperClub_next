export type AdminSection =
  | "customers"
  | "events"
  | "email"
  | "test-email"
  | "confirmation-email";

export type AdminViewState = {
  activeSection: AdminSection;
  eventSelected: number | null;
  customerSelected: number | null;
};

export const ADMIN_NAV_ITEMS: { href: string; label: string; match: string }[] = [
  { href: "/admin/events", label: "Events", match: "/admin/events" },
  { href: "/admin/customers", label: "Customers", match: "/admin/customers" },
  { href: "/admin/email", label: "Email All", match: "/admin/email" },
  { href: "/admin/send-email", label: "Send Email", match: "/admin/send-email" },
  { href: "/admin/confirmation-email", label: "Confirmation Email", match: "/admin/confirmation-email" },
];

const parseId = (rawId: string | null): number | null => {
  if (!rawId) {
    return null;
  }

  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const parseAdminRecordId = (rawId: string | undefined): number | null =>
  parseId(rawId ?? null);

/** Anything unrecognised lands on the events list, which is the default view. */
export const resolveAdminView = (
  view: string | null,
  rawId: string | null
): AdminViewState => {
  const id = parseId(rawId);

  if (view === "customer") {
    return { activeSection: "customers", eventSelected: null, customerSelected: id };
  }

  if (view === "email" || view === "test-email" || view === "confirmation-email") {
    return { activeSection: view, eventSelected: null, customerSelected: null };
  }

  return { activeSection: "events", eventSelected: id, customerSelected: null };
};

export const getAdminPath = ({
  activeSection,
  eventSelected,
  customerSelected,
}: AdminViewState): string => {
  if (activeSection === "customers") {
    return customerSelected ? `/admin/customers/${customerSelected}` : "/admin/customers";
  }

  if (activeSection === "email") {
    return "/admin/email";
  }

  if (activeSection === "test-email") {
    return "/admin/send-email";
  }

  if (activeSection === "confirmation-email") {
    return "/admin/confirmation-email";
  }

  return eventSelected ? `/admin/events/${eventSelected}` : "/admin/events";
};

export const isAdminNavActive = (pathname: string, match: string): boolean =>
  pathname === match || pathname.startsWith(`${match}/`);
