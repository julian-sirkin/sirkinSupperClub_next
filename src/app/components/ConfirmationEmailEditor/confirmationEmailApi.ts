import { OrderConfirmationTemplate } from "@/app/emails/renderOrderConfirmationEmail";
import { EmailTemplateSource } from "@/app/emails/pickEmailTemplate";

export type ConfirmationTemplateResponse = {
  template: OrderConfirmationTemplate & { source: EmailTemplateSource };
  defaultTemplate: OrderConfirmationTemplate;
};

const buildUrl = (eventId?: number | null) =>
  eventId ? `/api/emailTemplate?eventId=${eventId}` : "/api/emailTemplate";

export const fetchConfirmationTemplate = async (
  eventId?: number | null
): Promise<ConfirmationTemplateResponse> => {
  const response = await fetch(buildUrl(eventId));

  if (!response.ok) {
    throw new Error("Could not load the confirmation email");
  }

  return response.json();
};

export const saveConfirmationTemplate = async ({
  eventId,
  subject,
  bodyHtml,
  signOff,
}: OrderConfirmationTemplate & { eventId?: number | null }): Promise<void> => {
  const response = await fetch("/api/emailTemplate", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId: eventId ?? null, subject, bodyHtml, signOff }),
  });

  if (!response.ok) {
    const { message } = await response.json().catch(() => ({ message: "" }));
    throw new Error(message || "Could not save the confirmation email");
  }
};

export const clearConfirmationTemplate = async (eventId?: number | null): Promise<void> => {
  const response = await fetch(buildUrl(eventId), { method: "DELETE" });

  if (!response.ok) {
    throw new Error("Could not reset the confirmation email");
  }
};
