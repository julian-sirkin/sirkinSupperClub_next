import { NextResponse } from "next/server";
import {
  buildMarketingPreview,
  getMarketingRecipientCount,
  sendMarketingCampaign,
  sendMarketingTestEmail,
  getMarketingRecipientStats,
  type MarketingAudience,
  type MarketingComposeInput,
  type MarketingPhoto,
  type MarketingSocialLink,
} from "@/app/services/email/eventMarketingEmailService";

type MarketingEmailAction = "recipientCount" | "preview" | "test" | "send";

type MarketingEmailRequest = {
  action: MarketingEmailAction;
  eventId: number;
  subject?: string;
  preMenuSummary?: string;
  content?: string;
  signOff?: string;
  tiktokLinks?: Array<string | MarketingSocialLink>;
  selectedPhotos?: MarketingPhoto[];
  audience?: MarketingAudience;
};

function normalizeSocialLinks(
  value: MarketingEmailRequest["tiktokLinks"]
): MarketingSocialLink[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry === "string") {
        return { url: entry.trim(), label: "" };
      }

      return {
        url: entry?.url?.trim() ?? "",
        label: entry?.label?.trim() ?? "",
      };
    })
    .filter((entry) => entry.url.length > 0);
}

function getNormalizedComposeInput(payload: MarketingEmailRequest): MarketingComposeInput {
  return {
    eventId: Number(payload.eventId),
    subject: payload.subject?.trim() ?? "",
    preMenuSummary: payload.preMenuSummary?.trim() ?? "",
    content: payload.content?.trim() ?? "",
    signOff: payload.signOff?.trim() || "Best,",
    tiktokLinks: normalizeSocialLinks(payload.tiktokLinks),
    selectedPhotos: Array.isArray(payload.selectedPhotos) ? payload.selectedPhotos : [],
    audience: payload.audience ?? "all_subscribed",
  };
}

function validateRequiredComposeFields(input: MarketingComposeInput): string | null {
  if (!input.eventId) {
    return "A valid eventId is required";
  }

  if (!input.subject) {
    return "Subject is required";
  }

  if (!input.content) {
    return "Content is required";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MarketingEmailRequest;
    const action = body?.action;
    const eventId = Number(body?.eventId);

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    if (!eventId) {
      return NextResponse.json({ error: "Missing or invalid eventId" }, { status: 400 });
    }

    if (action === "recipientCount") {
      const audience = body.audience ?? "all_subscribed";
      const stats = await getMarketingRecipientStats(eventId, audience);
      return NextResponse.json({
        recipientCount: stats.sendCount,
        stats,
      });
    }

    const composeInput = getNormalizedComposeInput(body);
    const validationError = validateRequiredComposeFields(composeInput);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (action === "preview") {
      const result = await buildMarketingPreview(composeInput);
      return NextResponse.json({
        html: result.html,
        recipientCount: result.recipientCount,
        stats: result.stats,
      });
    }

    if (action === "test") {
      await sendMarketingTestEmail(composeInput);
      return NextResponse.json({ message: "Test email sent successfully" });
    }

    if (action === "send") {
      const origin = new URL(request.url).origin;
      const result = await sendMarketingCampaign(composeInput, origin);
      return NextResponse.json({
        message: "Marketing campaign sent successfully",
        recipientCount: result.recipientCount,
        batchesSent: result.batchesSent,
        audience: result.audience,
        stats: result.stats,
      });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    console.error("Error in eventMarketingEmail route:", error);
    return NextResponse.json(
      { error: "Failed to process event marketing email request" },
      { status: 500 }
    );
  }
}
