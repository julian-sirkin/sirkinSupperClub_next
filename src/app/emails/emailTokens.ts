export const ORDER_CONFIRMATION_TOKENS = [
  { token: "customerName", description: "The guest's name" },
  { token: "customerEmail", description: "The email they registered with" },
  { token: "eventDate", description: "The full date of the event" },
  { token: "ticketDetails", description: "Formatted table of every ticket, add-on, and the total" },
  { token: "ticketSummary", description: "One-line list of tickets, e.g. 2x 6pm Seating" },
  { token: "seatingTimes", description: "The seating times the guest booked" },
  { token: "orderTotal", description: "Order total in dollars" },
  { token: "venmoLink", description: "Venmo payment link" },
  { token: "contactEmail", description: "Sirkin Supper Club contact email link" },
] as const;

export type OrderConfirmationToken = (typeof ORDER_CONFIRMATION_TOKENS)[number]["token"];

export type EmailTokenValues = Record<string, string>;

const TOKEN_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/** Replaces every `{{token}}` that has a value. Unknown tokens are left in place so a typo is visible rather than silently dropped. */
export const applyEmailTokens = (template: string, values: EmailTokenValues): string => {
  if (!template) {
    return "";
  }

  return template.replace(TOKEN_PATTERN, (fullMatch, tokenName: string) => {
    const value = values[tokenName];
    return value === undefined ? fullMatch : value;
  });
};

/** Tokens used in the template that the renderer has no value for. Surfaced in the admin editor before saving. */
export const findUnknownTokens = (template: string): string[] => {
  const knownTokens = new Set<string>(ORDER_CONFIRMATION_TOKENS.map((entry) => entry.token));
  const unknownTokens = new Set<string>();

  for (const match of Array.from(template.matchAll(TOKEN_PATTERN))) {
    const tokenName = match[1];
    if (!knownTokens.has(tokenName)) {
      unknownTokens.add(tokenName);
    }
  }

  return Array.from(unknownTokens);
};
