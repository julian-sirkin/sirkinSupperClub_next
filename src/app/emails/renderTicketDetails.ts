import { escapeHtml } from "@/app/utils/escapeHtml";
import { emailColors, emailFontStack } from "./emailTheme";
import {
  OrderTicket,
  formatTicketDateTime,
  getOrderTotal,
  getTicketLineTotal,
} from "./orderSummary";

const labelStyle = `color:${emailColors.mutedText};font-size:14px;line-height:1.6;font-family:${emailFontStack};`;
const valueStyle = `color:${emailColors.bodyText};font-size:15px;line-height:1.6;font-family:${emailFontStack};`;

const renderDetailRow = (label: string, value: string) => `
  <tr>
    <td style="${labelStyle}padding:2px 12px 2px 0;white-space:nowrap;">${escapeHtml(label)}</td>
    <td style="${valueStyle}padding:2px 0;">${escapeHtml(value)}</td>
  </tr>
`;

const renderTicketRow = (ticket: OrderTicket, clientTimeZone?: string) => {
  const hasAddon =
    Boolean(ticket.selectedAddonContentfulId) && (ticket.addonQuantity ?? 0) > 0;

  const addonRow = hasAddon
    ? renderDetailRow(
        "Add-on",
        `${ticket.selectedAddonTitle ?? "Add-on"} (x${ticket.addonQuantity})`
      )
    : "";

  return `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid ${emailColors.subtleBorder};">
        <p style="margin:0 0 8px 0;color:${emailColors.heading};font-size:18px;font-weight:bold;font-family:${emailFontStack};">
          ${escapeHtml(ticket.title)}
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          ${renderDetailRow("When", formatTicketDateTime(ticket.time, clientTimeZone))}
          ${renderDetailRow("Seats", String(ticket.quantity))}
          ${addonRow}
          ${renderDetailRow("Subtotal", `$${getTicketLineTotal(ticket).toFixed(2)}`)}
        </table>
      </td>
    </tr>
  `;
};

/** The order breakdown is generated from the real purchase, so it stays accurate no matter how the admin edits the surrounding copy. */
export const renderTicketDetails = (
  tickets: OrderTicket[],
  clientTimeZone?: string
): string => {
  if (tickets.length === 0) {
    return "";
  }

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${emailColors.panelBackground}" style="width:100%;background-color:${emailColors.panelBackground};border:1px solid ${emailColors.border};border-radius:8px;margin:0 0 24px 0;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 4px 0;color:${emailColors.heading};font-size:20px;font-weight:bold;font-family:${emailFontStack};">
            Your Reservation
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
            ${tickets.map((ticket) => renderTicketRow(ticket, clientTimeZone)).join("")}
            <tr>
              <td style="padding:16px 0 0 0;">
                <p style="margin:0;color:${emailColors.heading};font-size:18px;font-weight:bold;font-family:${emailFontStack};">
                  Total: $${getOrderTotal(tickets).toFixed(2)}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};
