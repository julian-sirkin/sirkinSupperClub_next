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

const VIEW_PARAM_BY_SECTION: Record<AdminSection, string | null> = {
  customers: "customer",
  // Events is the default view, so it carries no view param.
  events: null,
  email: "email",
  "test-email": "test-email",
  "confirmation-email": "confirmation-email",
};

const parseId = (rawId: string | null): number | null => {
  if (!rawId) {
    return null;
  }

  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
};

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

export const buildAdminUrl = ({
  currentUrl,
  section,
  id,
}: {
  currentUrl: string;
  section: AdminSection;
  id: number | null;
}): URL => {
  const url = new URL(currentUrl);
  const viewParam = VIEW_PARAM_BY_SECTION[section];

  if (viewParam) {
    url.searchParams.set("view", viewParam);
  } else {
    url.searchParams.delete("view");
  }

  if (id) {
    url.searchParams.set("id", id.toString());
  } else {
    url.searchParams.delete("id");
  }

  return url;
};

/** Only the events and customers views address a specific record. */
export const sectionKeepsSelectedId = (section: AdminSection): boolean =>
  section === "events" || section === "customers";
