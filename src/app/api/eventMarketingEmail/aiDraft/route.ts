import { NextResponse } from "next/server";
import { getMarketingEventContext } from "@/app/services/email/eventMarketingEmailService";

type AnthropicTextBlock = {
  type?: string;
  text?: string;
};

type AnthropicResponse = {
  content?: AnthropicTextBlock[];
};

type AIDraftRequest = {
  eventId: number;
  generationNotes?: string;
};

type AIDraftParts = {
  subject: string;
  preMenuSummary: string;
  content: string;
};

type AnthropicErrorPayload = {
  type?: string;
  error?: {
    type?: string;
    message?: string;
  };
};

type AnthropicRequestParams = {
  apiKey: string;
  model: string;
  prompt: string;
};

function formatEventDate(eventDate: number | null): string {
  if (!eventDate) {
    return "Date coming soon";
  }

  const parsedDate = new Date(eventDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Date coming soon";
  }

  return parsedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function buildMenuTeaseText(menuHighlights: string[]): string {
  if (menuHighlights.length === 0) {
    return "A seasonal multi-course menu is planned.";
  }

  const teaserItems = menuHighlights.slice(0, 2);
  return teaserItems.join(" + ");
}

function getDescriptionSnippet(descriptionText: string): string {
  const normalized = descriptionText.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "Expect a thoughtful multi-course dinner with a warm, social atmosphere.";
  }

  return normalized.slice(0, 220);
}

async function requestAnthropicContent({
  apiKey,
  model,
  prompt,
}: AnthropicRequestParams): Promise<AnthropicResponse | null> {
  let anthropicResponse: Response;
  try {
    anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 900,
        temperature: 0.6,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (error) {
    console.error(`Anthropic draft request network failure for model ${model}:`, error);
    return null;
  }

  if (!anthropicResponse.ok) {
    const rawError = await anthropicResponse.text();
    let parsedError: AnthropicErrorPayload | null = null;

    try {
      parsedError = JSON.parse(rawError) as AnthropicErrorPayload;
    } catch {
      parsedError = null;
    }

    const isModelNotFound = parsedError?.error?.type === "not_found_error";
    console.error(`Anthropic draft request failed for model ${model}:`, rawError);

    if (isModelNotFound) {
      return null;
    }

    return null;
  }

  return (await anthropicResponse.json()) as AnthropicResponse;
}

function buildFallbackDraft(context: Awaited<ReturnType<typeof getMarketingEventContext>>) {
  const eventDate = formatEventDate(context.eventDate);
  const subject = `A fresh secret dinner invite: ${context.eventTitle}`;
  const descriptionSnippet = getDescriptionSnippet(context.descriptionText);
  const menuTease = buildMenuTeaseText(context.menuHighlights);
  const preMenuSummary = `
    <h2>${context.eventTitle}</h2>
    <p>I am putting together another intimate dinner and wanted to share it with you first. The night is built to feel warm, social, and a little unexpected, with a menu that keeps unfolding as the evening goes on. Think ${menuTease} to set the tone, then a full experience that is meant to be enjoyed at a relaxed pace around one shared table.</p>
  `;

  const content = `
    <p><strong>Date:</strong> ${eventDate}</p>
    <p><strong>Seats:</strong> ${context.ticketMomentumText}</p>
    <p>${descriptionSnippet}</p>
    <p>This one is designed to feel social and relaxed, with enough room to actually connect with the people around you while still getting the full experience.</p>
    <ul>
      <li>Limited seats keep the dinner personal and interactive.</li>
      <li>BYOB is welcome.</li>
      <li>Tipping is always optional and appreciated.</li>
      <li>Full event details and reservations are on the event page.</li>
    </ul>
    <p><a href="${context.eventUrl}">View event details and purchase tickets</a></p>
  `;

  return { subject, preMenuSummary, content };
}

function parseAnthropicContent(responseData: AnthropicResponse): string | null {
  if (!Array.isArray(responseData.content)) {
    return null;
  }

  const textBlocks = responseData.content
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text?.trim() ?? "")
    .filter((value) => value.length > 0);

  if (textBlocks.length === 0) {
    return null;
  }

  return textBlocks.join("\n").trim();
}

function parseDraftParts(rawContent: string): AIDraftParts {
  const subjectMatch = rawContent.match(/<subject>([\s\S]*?)<\/subject>/i);
  const summaryMatch = rawContent.match(/<pre_menu_summary>([\s\S]*?)<\/pre_menu_summary>/i);
  const bodyMatch = rawContent.match(/<main_body>([\s\S]*?)<\/main_body>/i);

  if (!summaryMatch || !bodyMatch) {
    return {
      subject: subjectMatch?.[1]?.trim() ?? "",
      preMenuSummary: "",
      content: rawContent.trim(),
    };
  }

  return {
    subject: subjectMatch?.[1]?.trim() ?? "",
    preMenuSummary: summaryMatch[1]?.trim() ?? "",
    content: bodyMatch[1]?.trim() ?? "",
  };
}

function stripHtmlTags(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function softenListHeavyBody(content: string): string {
  const listMatches: string[] = [];
  const itemRegex = /<li>([\s\S]*?)<\/li>/gi;
  let match = itemRegex.exec(content);
  while (match) {
    listMatches.push(stripHtmlTags(match[1] ?? ""));
    match = itemRegex.exec(content);
  }

  if (listMatches.length < 3) {
    return content;
  }

  const proseFromList = `<p>${listMatches.join(" ")}</p>`;
  return content.replace(/<ul>[\s\S]*?<\/ul>/i, proseFromList);
}

function getModelCandidates(): string[] {
  const fromEnv = process.env.ANTHROPIC_MODEL?.trim();
  const defaults = ["claude-3-5-haiku-20241022", "claude-3-5-sonnet-20241022"];
  return fromEnv ? [fromEnv, ...defaults.filter((model) => model !== fromEnv)] : defaults;
}

function ensureEventLinkInDraft(content: string, eventUrl: string): string {
  const normalizedContent = content.trim();
  if (normalizedContent.includes(eventUrl)) {
    return normalizedContent;
  }

  return `${normalizedContent}
<p><a href="${eventUrl}">View event details and purchase tickets</a></p>`;
}

function ensureRequiredSectionsInDraft(
  draft: AIDraftParts,
  context: Awaited<ReturnType<typeof getMarketingEventContext>>
): AIDraftParts {
  const eventDate = formatEventDate(context.eventDate);
  let nextSummary = draft.preMenuSummary.trim();
  let nextContent = draft.content.trim();

  if (!nextSummary) {
    nextSummary = `<p>A quick secret-dinner tease: this upcoming night is built to surprise and delight.</p>`;
  }

  if (!nextContent.includes("<strong>Date:</strong>")) {
    nextContent = `${nextContent}\n<p><strong>Date:</strong> ${eventDate}</p>`;
  }

  if (!nextContent.includes("<strong>Seats:</strong>")) {
    nextContent = `${nextContent}\n<p><strong>Seats:</strong> ${context.ticketMomentumText}</p>`;
  }

  if (!nextContent.toLowerCase().includes("byob")) {
    nextContent = `${nextContent}\n<p>BYOB is welcome.</p>`;
  }

  nextContent = softenListHeavyBody(nextContent);
  nextContent = enforceReadableParagraphs(nextContent);

  return {
    subject: draft.subject.trim(),
    preMenuSummary: nextSummary,
    content: ensureEventLinkInDraft(nextContent, context.eventUrl),
  };
}

function enforceReadableParagraphs(content: string): string {
  const paragraphMatches = content.match(/<p>[\s\S]*?<\/p>/gi) ?? [];
  if (paragraphMatches.length >= 3) {
    return content;
  }

  const plain = stripHtmlTags(content);
  if (!plain) {
    return content;
  }

  const normalized = plain
    .replace(/\s+/g, " ")
    .replace(/\bWhen:\b/gi, "Date:")
    .replace(/\bat\s+\d{1,2}:\d{2}\s*(AM|PM)\b/gi, "")
    .trim();

  const dateLineMatch = normalized.match(/Date:\s*[^.?!]+/i);
  const seatsLineMatch = normalized.match(/Seats:\s*[^.?!]+/i);
  const dateLine = dateLineMatch ? `<p><strong>Date:</strong> ${dateLineMatch[0].replace(/Date:\s*/i, "").trim()}</p>` : "";
  const seatsLine = seatsLineMatch ? `<p><strong>Seats:</strong> ${seatsLineMatch[0].replace(/Seats:\s*/i, "").trim()}</p>` : "";

  const withoutMeta = normalized
    .replace(/Date:\s*[^.?!]+[.?!]?\s*/i, "")
    .replace(/Seats:\s*[^.?!]+[.?!]?\s*/i, "")
    .trim();

  const sentences = withoutMeta
    .split(/(?<=[.?!])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  const chunked: string[] = [];
  for (let index = 0; index < sentences.length; index += 2) {
    const combined = sentences.slice(index, index + 2).join(" ").trim();
    if (combined) {
      chunked.push(`<p>${combined}</p>`);
    }
  }

  return [dateLine, seatsLine, ...chunked].filter(Boolean).join("\n");
}

function isThinSummary(summary: string): boolean {
  const textOnly = stripHtmlTags(summary);
  return textOnly.length < 140;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AIDraftRequest;
    const eventId = Number(body?.eventId);
    const generationNotes = typeof body?.generationNotes === "string" ? body.generationNotes.trim() : "";

    if (!eventId) {
      return NextResponse.json({ error: "Missing or invalid eventId" }, { status: 400 });
    }

    const context = await getMarketingEventContext(eventId);
    const fallback = buildFallbackDraft(context);
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        subject: fallback.subject,
        preMenuSummary: fallback.preMenuSummary,
        content: fallback.content,
        usedFallback: true,
      });
    }

    const prompt = `
Write concise, friendly, playful HTML for TWO editable sections of a secret-dinner marketing email.
Use only these HTML tags: <h2>, <p>, <ul>, <li>, <strong>, <em>, <a>.
Target 170-240 words total across both sections.
Tone: personal, warm, lightly playful, and teasing.
Goal: entice people to click through to the event page for the full reveal and to reserve tickets.
Do not copy website text or long descriptions verbatim.
Output must contain EXACTLY these wrappers, no markdown fences:
<subject>
...short, punchy, human subject line...
</subject>
<pre_menu_summary>
...quick human hook/teaser only (no logistics, no BYOB, no seat count)...
</pre_menu_summary>
<main_body>
...clear practical details + fuller picture of experience...
</main_body>

Main body requirements:
- Write as readable email copy with clear paragraph breaks.
- Use 3-5 short paragraphs (2-4 sentences each).
- Keep bullets minimal (0-2) and only if they improve readability.
- Include <strong>Date:</strong> (date only, never include a clock time).
- Include <strong>Seats:</strong> and ticket momentum.
- Include concrete details about seating/intimacy/what the night feels like.
- Include 1-2 specific ideas inspired by the event description, but paraphrase in your own words.
- Keep it specific and compelling, but do NOT paste the full website description.
- Include BYOB and optional tipping naturally in the copy.
- Include one direct event link CTA.

Event title: ${context.eventTitle}
Event date: ${formatEventDate(context.eventDate)}
Event link: ${context.eventUrl}
Menu highlights: ${context.menuHighlights.join(" | ") || "N/A"}
Ticket momentum: ${context.ticketMomentumText}
Description context: ${context.descriptionText.slice(0, 900) || "N/A"}
Campaign-specific notes: ${generationNotes || "None provided"}
`.trim();

    const summaryOnlyPrompt = `
Write only a rich short paragraph for the pre-menu hook section of this event marketing email.
Use only HTML tags: <h2>, <p>, <strong>, <em>, <a>.
No bullet lists.
Target 80-130 words.
Tone: warm, conversational, personal, and lightly playful.
This section should feel like a human invitation and should not include logistics like "When" or seat counts.
Output must contain exactly:
<pre_menu_summary>
...content...
</pre_menu_summary>

Event title: ${context.eventTitle}
Event link: ${context.eventUrl}
Menu highlights: ${context.menuHighlights.join(" | ") || "N/A"}
Description context: ${context.descriptionText.slice(0, 900) || "N/A"}
Campaign-specific notes: ${generationNotes || "None provided"}
`.trim();

    const modelsToTry = getModelCandidates();
    let responseData: AnthropicResponse | null = null;

    for (const model of modelsToTry) {
      responseData = await requestAnthropicContent({ apiKey, model, prompt });
      if (responseData) {
        break;
      }
    }

    if (!responseData) {
      return NextResponse.json({
        subject: fallback.subject,
        preMenuSummary: fallback.preMenuSummary,
        content: fallback.content,
        usedFallback: true,
      });
    }

    const parsedContent = parseAnthropicContent(responseData);
    const parsedDraft = parsedContent ? parseDraftParts(parsedContent) : null;
    let normalizedDraft = parsedDraft
      ? ensureRequiredSectionsInDraft(parsedDraft, context)
      : {
          subject: fallback.subject,
          preMenuSummary: fallback.preMenuSummary,
          content: fallback.content,
        };

    if (isThinSummary(normalizedDraft.preMenuSummary)) {
      for (const model of modelsToTry) {
        const summaryResponse = await requestAnthropicContent({
          apiKey,
          model,
          prompt: summaryOnlyPrompt,
        });
        if (!summaryResponse) {
          continue;
        }

        const summaryParsed = parseAnthropicContent(summaryResponse);
        if (!summaryParsed) {
          continue;
        }

        const summaryDraft = parseDraftParts(summaryParsed);
        if (summaryDraft.preMenuSummary.trim()) {
          normalizedDraft = {
            ...normalizedDraft,
            preMenuSummary: summaryDraft.preMenuSummary.trim(),
          };
          break;
        }
      }
    }

    return NextResponse.json({
      subject: normalizedDraft.subject || fallback.subject,
      preMenuSummary: normalizedDraft.preMenuSummary,
      content: normalizedDraft.content,
      usedFallback: !parsedContent,
    });
  } catch (error) {
    console.error("Error generating marketing AI draft:", error);
    return NextResponse.json(
      { error: "Failed to generate AI draft" },
      { status: 500 }
    );
  }
}
