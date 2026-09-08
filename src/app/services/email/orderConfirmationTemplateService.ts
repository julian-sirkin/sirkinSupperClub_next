import { getEmailTemplate } from "@/app/api/queries/emailTemplates";
import {
  ORDER_CONFIRMATION_TEMPLATE_KEY,
  defaultOrderConfirmationTemplate,
} from "@/app/emails/orderConfirmationDefaults";
import { ResolvedEmailTemplate, pickEmailTemplate } from "@/app/emails/pickEmailTemplate";
import { OrderConfirmationTemplate } from "@/app/emails/renderOrderConfirmationEmail";

const toTemplate = (
  row: { subject: string; bodyHtml: string; signOff: string } | null
): OrderConfirmationTemplate | null =>
  row ? { subject: row.subject, bodyHtml: row.bodyHtml, signOff: row.signOff } : null;

/**
 * A confirmation email must never fail to send because the template could not be
 * read, so a database problem falls back to the copy in code.
 */
export const resolveOrderConfirmationTemplate = async (
  eventId?: number | null
): Promise<ResolvedEmailTemplate> => {
  try {
    const globalTemplate = toTemplate(
      await getEmailTemplate({ templateKey: ORDER_CONFIRMATION_TEMPLATE_KEY, eventId: null })
    );

    const eventTemplate = eventId
      ? toTemplate(
          await getEmailTemplate({ templateKey: ORDER_CONFIRMATION_TEMPLATE_KEY, eventId })
        )
      : null;

    return pickEmailTemplate({
      eventTemplate,
      globalTemplate,
      defaultTemplate: defaultOrderConfirmationTemplate,
    });
  } catch (error) {
    console.error("Could not load the order confirmation template, using the default:", error);
    return { ...defaultOrderConfirmationTemplate, source: "default" };
  }
};
