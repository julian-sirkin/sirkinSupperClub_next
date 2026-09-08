"use client";

import { EmailTemplateSource } from "@/app/emails/pickEmailTemplate";
import { OrderConfirmationTemplate } from "@/app/emails/renderOrderConfirmationEmail";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  clearConfirmationTemplate,
  fetchConfirmationTemplate,
  saveConfirmationTemplate,
} from "./confirmationEmailApi";

const EMPTY_TEMPLATE: OrderConfirmationTemplate = {
  subject: "",
  bodyHtml: "",
  signOff: "",
};

export const useConfirmationEmailTemplate = (eventId?: number | null) => {
  const [template, setTemplate] = useState<OrderConfirmationTemplate>(EMPTY_TEMPLATE);
  const [defaultTemplate, setDefaultTemplate] =
    useState<OrderConfirmationTemplate>(EMPTY_TEMPLATE);
  const [source, setSource] = useState<EmailTemplateSource>("default");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadTemplate = useCallback(async () => {
    setIsLoading(true);
    try {
      const { template: resolved, defaultTemplate: shipped } =
        await fetchConfirmationTemplate(eventId);

      setTemplate({
        subject: resolved.subject,
        bodyHtml: resolved.bodyHtml,
        signOff: resolved.signOff,
      });
      setDefaultTemplate(shipped);
      setSource(resolved.source);
    } catch (error) {
      console.error("Error loading the confirmation email:", error);
      toast.error("Could not load the confirmation email");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const updateField = (field: keyof OrderConfirmationTemplate, value: string) => {
    setTemplate((current) => ({ ...current, [field]: value }));
  };

  const save = async () => {
    setIsSaving(true);
    try {
      await saveConfirmationTemplate({ ...template, eventId });
      toast.success(eventId ? "Override saved for this event" : "Confirmation email saved");
      await loadTemplate();
    } catch (error) {
      console.error("Error saving the confirmation email:", error);
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setIsSaving(false);
    }
  };

  /** Loads the original wording into the editor without saving, so it can be reviewed first. */
  const restoreDefaultCopy = () => {
    setTemplate(defaultTemplate);
    toast.info("Original wording loaded. Save to apply it.");
  };

  const clearSavedTemplate = async () => {
    setIsSaving(true);
    try {
      await clearConfirmationTemplate(eventId);
      toast.success(eventId ? "This event now uses the default email" : "Confirmation email reset");
      await loadTemplate();
    } catch (error) {
      console.error("Error resetting the confirmation email:", error);
      toast.error("Could not reset the confirmation email");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    template,
    source,
    isLoading,
    isSaving,
    updateField,
    save,
    restoreDefaultCopy,
    clearSavedTemplate,
  };
};
