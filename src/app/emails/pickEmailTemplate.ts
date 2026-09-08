import { OrderConfirmationTemplate } from "./renderOrderConfirmationEmail";

export type EmailTemplateSource = "event" | "global" | "default";

export type ResolvedEmailTemplate = OrderConfirmationTemplate & {
  source: EmailTemplateSource;
};

/**
 * A per-event override wins over the saved default, which in turn wins over the
 * copy shipped in code. The code default is the safety net that keeps
 * confirmation emails sending before anything has been saved in the admin panel.
 */
export const pickEmailTemplate = ({
  eventTemplate,
  globalTemplate,
  defaultTemplate,
}: {
  eventTemplate?: OrderConfirmationTemplate | null;
  globalTemplate?: OrderConfirmationTemplate | null;
  defaultTemplate: OrderConfirmationTemplate;
}): ResolvedEmailTemplate => {
  if (eventTemplate) {
    return { ...eventTemplate, source: "event" };
  }

  if (globalTemplate) {
    return { ...globalTemplate, source: "global" };
  }

  return { ...defaultTemplate, source: "default" };
};
