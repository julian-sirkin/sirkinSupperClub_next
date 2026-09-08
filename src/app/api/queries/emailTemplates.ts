import { db } from "@/db";
import { emailTemplatesTable, SelectEmailTemplate } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export type EmailTemplateScope = {
  templateKey: string;
  /** Null targets the global default used by every event. */
  eventId: number | null;
};

const scopeCondition = ({ templateKey, eventId }: EmailTemplateScope) =>
  and(
    eq(emailTemplatesTable.templateKey, templateKey),
    eventId === null
      ? isNull(emailTemplatesTable.eventId)
      : eq(emailTemplatesTable.eventId, eventId)
  );

export const getEmailTemplate = async (
  scope: EmailTemplateScope
): Promise<SelectEmailTemplate | null> => {
  const rows = await db.select().from(emailTemplatesTable).where(scopeCondition(scope));

  return rows[0] ?? null;
};

export const saveEmailTemplate = async ({
  templateKey,
  eventId,
  subject,
  bodyHtml,
  signOff,
}: EmailTemplateScope & {
  subject: string;
  bodyHtml: string;
  signOff: string;
}): Promise<void> => {
  const existingTemplate = await getEmailTemplate({ templateKey, eventId });
  const updatedAt = new Date();

  if (existingTemplate) {
    await db
      .update(emailTemplatesTable)
      .set({ subject, bodyHtml, signOff, updatedAt })
      .where(eq(emailTemplatesTable.id, existingTemplate.id));
    return;
  }

  await db
    .insert(emailTemplatesTable)
    .values({ templateKey, eventId, subject, bodyHtml, signOff, updatedAt });
};

/** Deleting a row falls the scope back to the next one up: an event to the default, the default to the copy in code. */
export const deleteEmailTemplate = async (scope: EmailTemplateScope): Promise<void> => {
  await db.delete(emailTemplatesTable).where(scopeCondition(scope));
};
