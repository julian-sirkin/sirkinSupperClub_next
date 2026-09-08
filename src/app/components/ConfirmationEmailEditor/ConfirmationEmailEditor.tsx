"use client";

import { findUnknownTokens } from "@/app/emails/emailTokens";
import { renderOrderConfirmationEmail } from "@/app/emails/renderOrderConfirmationEmail";
import { buildSampleOrderPreview } from "@/app/emails/sampleOrderPreview";
import { useMemo } from "react";
import { ConfirmationEmailEditorUI } from "./ConfirmationEmailEditorUI";
import { useConfirmationEmailTemplate } from "./useConfirmationEmailTemplate";

export const ConfirmationEmailEditor = ({
  eventId,
  eventTitle,
}: {
  eventId?: number | null;
  eventTitle?: string;
}) => {
  const {
    template,
    source,
    isLoading,
    isSaving,
    updateField,
    save,
    restoreDefaultCopy,
    clearSavedTemplate,
  } = useConfirmationEmailTemplate(eventId);

  const sampleOrder = useMemo(() => buildSampleOrderPreview(), []);

  const preview = useMemo(
    () => renderOrderConfirmationEmail({ template, context: sampleOrder }),
    [template, sampleOrder]
  );

  const unknownTokens = useMemo(
    () => findUnknownTokens(`${template.subject} ${template.bodyHtml}`),
    [template.subject, template.bodyHtml]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    );
  }

  const isEventScoped = Boolean(eventId);

  return (
    <ConfirmationEmailEditorUI
      title={isEventScoped ? "Confirmation Email for This Event" : "Confirmation Email"}
      description={
        isEventScoped
          ? `Overrides the default confirmation email for ${eventTitle ?? "this event"} only.`
          : "Sent to every guest as soon as they claim their seats."
      }
      template={template}
      source={source}
      unknownTokens={unknownTokens}
      previewSubject={preview.subject}
      previewHtml={preview.html}
      isSaving={isSaving}
      canClearSavedTemplate={isEventScoped ? source === "event" : source === "global"}
      clearSavedTemplateLabel={
        isEventScoped ? "Use the Default Email" : "Delete Saved Version"
      }
      onFieldChange={updateField}
      onSave={save}
      onRestoreDefaultCopy={restoreDefaultCopy}
      onClearSavedTemplate={clearSavedTemplate}
    />
  );
};
