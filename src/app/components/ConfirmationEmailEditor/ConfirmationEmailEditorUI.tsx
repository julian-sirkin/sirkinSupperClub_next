"use client";

import { OrderConfirmationTemplate } from "@/app/emails/renderOrderConfirmationEmail";
import { EmailTemplateSource } from "@/app/emails/pickEmailTemplate";
import { RichTextEditor } from "../EmailComposer/RichTextEditor";
import { TokenReference } from "./TokenReference";

const SOURCE_DESCRIPTIONS: Record<EmailTemplateSource, string> = {
  event: "This event uses its own version of the confirmation email.",
  global: "Using your saved confirmation email.",
  default: "Using the original wording. Nothing has been saved yet.",
};

const inputClassName =
  "w-full p-2 bg-black border border-gold/30 rounded text-white focus:outline-none focus:border-gold";

const primaryButtonClassName =
  "px-6 py-2 rounded font-semibold transition-colors bg-gold text-black hover:bg-white disabled:bg-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed";

const secondaryButtonClassName =
  "px-6 py-2 rounded font-semibold bg-black text-gold border border-gold hover:bg-gold hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

type ConfirmationEmailEditorUIProps = {
  title: string;
  description: string;
  template: OrderConfirmationTemplate;
  source: EmailTemplateSource;
  unknownTokens: string[];
  previewHtml: string;
  isSaving: boolean;
  canClearSavedTemplate: boolean;
  clearSavedTemplateLabel: string;
  onFieldChange: (field: keyof OrderConfirmationTemplate, value: string) => void;
  onSave: () => void;
  onRestoreDefaultCopy: () => void;
  onClearSavedTemplate: () => void;
};

export const ConfirmationEmailEditorUI = ({
  title,
  description,
  template,
  source,
  unknownTokens,
  previewHtml,
  isSaving,
  canClearSavedTemplate,
  clearSavedTemplateLabel,
  onFieldChange,
  onSave,
  onRestoreDefaultCopy,
  onClearSavedTemplate,
}: ConfirmationEmailEditorUIProps) => {
  return (
    <div className="space-y-4">
      <div className="border-b border-gold/30 pb-4">
        <h2 className="text-2xl font-bold text-gold">{title}</h2>
        <p className="text-gray-400 mt-2">{description}</p>
        <p className="text-gray-400 mt-1 text-sm italic">{SOURCE_DESCRIPTIONS[source]}</p>
      </div>

      <TokenReference unknownTokens={unknownTokens} />

      <div className="space-y-2">
        <label htmlFor="confirmation-subject" className="block text-gold font-semibold">
          Subject
        </label>
        <input
          id="confirmation-subject"
          type="text"
          value={template.subject}
          onChange={(event) => onFieldChange("subject", event.target.value)}
          className={inputClassName}
          disabled={isSaving}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-gold font-semibold">Body</label>
        <RichTextEditor
          content={template.bodyHtml}
          onChange={(bodyHtml) => onFieldChange("bodyHtml", bodyHtml)}
          placeholder="Write the confirmation email..."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmation-sign-off" className="block text-gold font-semibold">
          Sign-off
        </label>
        <input
          id="confirmation-sign-off"
          type="text"
          value={template.signOff}
          onChange={(event) => onFieldChange("signOff", event.target.value)}
          className={inputClassName}
          disabled={isSaving}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-gold font-semibold">Preview</h3>
        <p className="text-gray-400 text-sm">
          Filled in with a sample order so you can see what a guest receives.
        </p>
        <div className="max-h-[60vh] overflow-y-auto rounded border border-gold/30">
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-4">
        <button
          onClick={onRestoreDefaultCopy}
          disabled={isSaving}
          className={secondaryButtonClassName}
          type="button"
        >
          Load Original Wording
        </button>
        {canClearSavedTemplate && (
          <button
            onClick={onClearSavedTemplate}
            disabled={isSaving}
            className={secondaryButtonClassName}
            type="button"
          >
            {clearSavedTemplateLabel}
          </button>
        )}
        <button
          onClick={onSave}
          disabled={isSaving}
          className={primaryButtonClassName}
          type="button"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};
