export const ORDER_CONFIRMATION_TEMPLATE_KEY = "order_confirmation";

export const DEFAULT_ORDER_CONFIRMATION_SUBJECT =
  "Your Sirkin Supper Club reservation is confirmed";

export const DEFAULT_ORDER_CONFIRMATION_SIGN_OFF = "See you at the table,";

/**
 * Written to survive a round trip through the rich-text editor, so it only uses
 * tags TipTap understands: h2, p, ul, li, strong, a.
 */
export const DEFAULT_ORDER_CONFIRMATION_BODY = `<h2>You're in, {{customerName}}</h2>
<p>Thank you so much for your order. This is my side passion project, and without people willing to take a leap on a stranger's cooking I couldn't do it. I'm looking forward to sharing some creative food with you and to introducing you to some genuinely great people.</p>
<p>This confirmation was sent to <strong>{{customerEmail}}</strong>. Hang on to it.</p>
{{ticketDetails}}
<h2>The details</h2>
<ul>
<li><strong>Date:</strong> {{eventDate}}</li>
<li><strong>Arrival:</strong> Your ticket is for the {{seatingTimes}} seating, so please plan to arrive at that time. Dinner is served as a group and a late arrival means a missed course.</li>
<li><strong>Location:</strong> I'll email you the address the day before the event.</li>
<li><strong>Payment:</strong> If you haven't already, please send payment via Venmo to {{venmoLink}}. Your total is {{orderTotal}}.</li>
</ul>
<h2>What to bring</h2>
<p>Please bring anything you'd like to drink beyond water and coffee, which I provide along with all the glassware. Wine, beer, whatever you're into. No need to bring glasses.</p>
<p>Tipping is completely optional and never expected, but it is always appreciated.</p>
<h2>Questions?</h2>
<p>Reach out any time at {{contactEmail}} and I'll get back to you. If something changes with your plans, just let me know as early as you can.</p>`;

export const defaultOrderConfirmationTemplate = {
  subject: DEFAULT_ORDER_CONFIRMATION_SUBJECT,
  bodyHtml: DEFAULT_ORDER_CONFIRMATION_BODY,
  signOff: DEFAULT_ORDER_CONFIRMATION_SIGN_OFF,
} as const;
