import {
  ORDER_CONFIRMATION_TEMPLATE_KEY,
  defaultOrderConfirmationTemplate,
} from "@/app/emails/orderConfirmationDefaults";
import { resolveOrderConfirmationTemplate } from "@/app/services/email/orderConfirmationTemplateService";
import { NextResponse } from "next/server";
import { deleteEmailTemplate, saveEmailTemplate } from "../queries/emailTemplates";
import { isAdminRequest } from "../utils/isAdminRequest";

const unauthorized = () => NextResponse.json({ message: "Unauthorized" }, { status: 401 });

const parseEventId = (rawEventId: unknown): number | null => {
  if (rawEventId === null || rawEventId === undefined || rawEventId === "") {
    return null;
  }

  const eventId = Number(rawEventId);
  return Number.isInteger(eventId) && eventId > 0 ? eventId : null;
};

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }

  const eventId = parseEventId(new URL(request.url).searchParams.get("eventId"));
  const template = await resolveOrderConfirmationTemplate(eventId);

  return NextResponse.json({
    template,
    defaultTemplate: defaultOrderConfirmationTemplate,
  });
}

export async function PUT(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }

  const body = await request.json();
  const subject = String(body?.subject ?? "").trim();
  const bodyHtml = String(body?.bodyHtml ?? "").trim();
  const signOff = String(body?.signOff ?? "").trim();

  if (!subject || !bodyHtml || !signOff) {
    return NextResponse.json(
      { message: "A subject, body, and sign-off are all required" },
      { status: 400 }
    );
  }

  try {
    await saveEmailTemplate({
      templateKey: ORDER_CONFIRMATION_TEMPLATE_KEY,
      eventId: parseEventId(body?.eventId),
      subject,
      bodyHtml,
      signOff,
    });

    return NextResponse.json({ message: "Confirmation email saved" });
  } catch (error) {
    console.error("Failed to save the confirmation email template:", error);
    return NextResponse.json({ message: "Could not save the template" }, { status: 500 });
  }
}

/** Removing a saved template falls the scope back: an event to the default, the default to the copy in code. */
export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }

  const eventId = parseEventId(new URL(request.url).searchParams.get("eventId"));

  try {
    await deleteEmailTemplate({
      templateKey: ORDER_CONFIRMATION_TEMPLATE_KEY,
      eventId,
    });

    return NextResponse.json({ message: "Confirmation email reset" });
  } catch (error) {
    console.error("Failed to reset the confirmation email template:", error);
    return NextResponse.json({ message: "Could not reset the template" }, { status: 500 });
  }
}
