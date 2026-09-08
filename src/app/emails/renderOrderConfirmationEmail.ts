import { CONTACT_EMAIL, VENMO_HANDLE, VENMO_URL } from "@/app/constants";
import { wrapEmailContent } from "@/app/utils/emailTemplate";
import { escapeHtml } from "@/app/utils/escapeHtml";
import { emailColors } from "./emailTheme";
import { applyEmailTokens } from "./emailTokens";
import { inlineEmailBodyStyles } from "./inlineEmailBodyStyles";
import {
  OrderTicket,
  buildSeatingTimesText,
  buildTicketSummaryText,
  formatEventDate,
  getEarliestTicketTime,
  getOrderTotal,
} from "./orderSummary";
import { renderTicketDetails } from "./renderTicketDetails";

export type OrderConfirmationTemplate = {
  subject: string;
  bodyHtml: string;
  signOff: string;
};

export type OrderConfirmationContext = {
  customerName: string;
  customerEmail: string;
  tickets: OrderTicket[];
  eventDate?: string | Date | null;
  eventUrl?: string;
  clientTimeZone?: string;
};

const linkStyle = `color:${emailColors.accent};text-decoration:underline;`;

const buildTokenValues = (context: OrderConfirmationContext) => {
  const { tickets, clientTimeZone } = context;
  const eventDateSource = context.eventDate ?? getEarliestTicketTime(tickets);

  return {
    customerName: escapeHtml(context.customerName || "friend"),
    customerEmail: escapeHtml(context.customerEmail),
    eventDate: eventDateSource
      ? formatEventDate(eventDateSource, clientTimeZone)
      : "Date to be announced",
    ticketDetails: renderTicketDetails(tickets, clientTimeZone),
    ticketSummary: escapeHtml(buildTicketSummaryText(tickets)),
    seatingTimes: escapeHtml(buildSeatingTimesText(tickets, clientTimeZone)),
    orderTotal: `$${getOrderTotal(tickets).toFixed(2)}`,
    venmoLink: `<a href="${VENMO_URL}" style="${linkStyle}">${VENMO_HANDLE}</a>`,
    contactEmail: `<a href="mailto:${CONTACT_EMAIL}" style="${linkStyle}">${CONTACT_EMAIL}</a>`,
  };
};

export const renderOrderConfirmationEmail = ({
  template,
  context,
}: {
  template: OrderConfirmationTemplate;
  context: OrderConfirmationContext;
}): { subject: string; html: string } => {
  const tokenValues = buildTokenValues(context);

  // Styles are inlined before tokens so the generated ticket table keeps its own
  // table styling instead of being rewritten as body copy.
  const styledBody = inlineEmailBodyStyles(template.bodyHtml);

  return {
    subject: applyEmailTokens(template.subject, tokenValues),
    html: wrapEmailContent(
      applyEmailTokens(styledBody, tokenValues),
      template.signOff,
      context.eventUrl
    ),
  };
};
