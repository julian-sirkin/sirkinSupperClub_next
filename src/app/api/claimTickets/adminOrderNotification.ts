import { escapeHtml } from "@/app/utils/escapeHtml";
import {
  OrderTicket,
  formatTicketDateTime,
  getOrderTotal,
  getTicketLineTotal,
} from "@/app/emails/orderSummary";

type AdminNotificationCustomer = {
  name: string;
  email: string;
  phoneNumber: string;
  notes: string;
  dietaryRestrictions: string;
};

const renderTicketLine = (ticket: OrderTicket, clientTimeZone?: string) => {
  const hasAddon =
    Boolean(ticket.selectedAddonContentfulId) && (ticket.addonQuantity ?? 0) > 0;
  const addonLine = hasAddon
    ? `Addon: ${escapeHtml(ticket.selectedAddonTitle ?? "")} (x${ticket.addonQuantity})<br>`
    : "";

  return `
    <li>
      Event: ${escapeHtml(ticket.title)} <br>
      Date: ${formatTicketDateTime(ticket.time, clientTimeZone)} <br>
      Quantity: ${ticket.quantity} <br>
      ${addonLine}
      Line Total: $${getTicketLineTotal(ticket).toFixed(2)}
    </li>
  `;
};

/** Plain markup on purpose: this one only ever lands in the admin inbox. */
export const renderAdminOrderNotification = ({
  customer,
  tickets,
  clientTimeZone,
}: {
  customer: AdminNotificationCustomer;
  tickets: OrderTicket[];
  clientTimeZone?: string;
}) => `
  <main>
    <h1>New Order Received</h1>
    <p>Customer Information:</p>
    <ul>
      <li>Name: ${escapeHtml(customer.name)}</li>
      <li>Email: ${escapeHtml(customer.email)}</li>
      <li>Phone Number: ${escapeHtml(customer.phoneNumber ?? "")}</li>
      <li>Comment: ${escapeHtml(customer.notes ?? "")}</li>
      <li>Dietary Restrictions: ${escapeHtml(customer.dietaryRestrictions ?? "")}</li>
    </ul>
    <p>Tickets Purchased:</p>
    <ul>
      ${tickets.map((ticket) => renderTicketLine(ticket, clientTimeZone)).join("")}
    </ul>
    <p><strong>Total Price: $${getOrderTotal(tickets).toFixed(2)}</strong></p>
  </main>
`;
