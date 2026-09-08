import { transporter } from "@/app/config/nodemailer";
import { CONTACT_EMAIL } from "@/app/constants";
import { renderOrderConfirmationEmail } from "@/app/emails/renderOrderConfirmationEmail";
import { resolveOrderConfirmationTemplate } from "@/app/services/email/orderConfirmationTemplateService";
import { SuccessEmailProps } from "../api.types";
import { findEventByContentfulId } from "../queries/select";
import { renderAdminOrderNotification } from "./adminOrderNotification";

const SITE_BASE_URL = "https://sirkinsupperclub.com";

type EventContext = {
  eventId: number | null;
  eventDate: Date | null;
  eventUrl: string | undefined;
};

const NO_EVENT_CONTEXT: EventContext = {
  eventId: null,
  eventDate: null,
  eventUrl: undefined,
};

/** Used to look up a per-event template override and to print the real event date. */
const getEventContext = async (
  eventContentfulId: string | undefined
): Promise<EventContext> => {
  if (!eventContentfulId) {
    return NO_EVENT_CONTEXT;
  }

  try {
    const [event] = await findEventByContentfulId(eventContentfulId);
    if (!event) {
      return NO_EVENT_CONTEXT;
    }

    return {
      eventId: event.id,
      eventDate: event.date ?? null,
      eventUrl: `${SITE_BASE_URL}/events/${encodeURIComponent(event.title)}`,
    };
  } catch (error) {
    console.error("Could not load event context for the confirmation email:", error);
    return NO_EVENT_CONTEXT;
  }
};

export const successEmail = async ({
  customer,
  tickets,
  clientTimeZone,
}: SuccessEmailProps) => {
  const { eventId, eventDate, eventUrl } = await getEventContext(
    tickets[0]?.eventContentfulId
  );

  const template = await resolveOrderConfirmationTemplate(eventId);
  const { subject, html } = renderOrderConfirmationEmail({
    template,
    context: {
      customerName: customer.name,
      customerEmail: customer.email,
      tickets,
      eventDate,
      eventUrl,
      clientTimeZone,
    },
  });

  try {
    await transporter.sendMail({
      from: CONTACT_EMAIL,
      to: customer.email,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send the customer confirmation email:", error);
    return { emailSuccessfully: false };
  }

  // The guest already has their confirmation, so a failed admin copy is logged
  // rather than reported to the guest as a failed order.
  try {
    await transporter.sendMail({
      from: CONTACT_EMAIL,
      to: CONTACT_EMAIL,
      subject: `New Order from ${customer.name}`,
      html: renderAdminOrderNotification({ customer, tickets, clientTimeZone }),
    });
  } catch (error) {
    console.error("Failed to send the admin order notification:", error);
  }

  return { emailSuccessfully: true };
};
