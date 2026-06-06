'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { RichTextEditor } from '../../EmailComposer/RichTextEditor';
import {
  fetchContentfulPhotos,
  generateEventMarketingAIDraftWithContext,
  getEventMarketingRecipientStats,
  previewEventMarketingEmail,
  sendEventMarketingCampaign,
  sendEventMarketingTestEmail,
  type MarketingAudience,
  type MarketingEmailPayload,
  type MarketingPhoto,
  type MarketingRecipientStats,
  type MarketingSocialLink,
} from '../services/eventService';

interface EventMarketingEmailSectionProps {
  eventId: number;
  eventTitle: string;
}

export function EventMarketingEmailSection({ eventId, eventTitle }: EventMarketingEmailSectionProps) {
  const [subject, setSubject] = useState('');
  const [preMenuSummary, setPreMenuSummary] = useState('');
  const [content, setContent] = useState('');
  const [signOff, setSignOff] = useState('Best,');
  const [socialLinks, setSocialLinks] = useState<MarketingSocialLink[]>([{ url: '', label: '' }]);
  const [availablePhotos, setAvailablePhotos] = useState<MarketingPhoto[]>([]);
  const [selectedPhotoUrls, setSelectedPhotoUrls] = useState<string[]>([]);
  const [audience, setAudience] = useState<MarketingAudience>('all_subscribed');
  const [recipientStats, setRecipientStats] = useState<MarketingRecipientStats | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);
  const [isAIPromptOpen, setIsAIPromptOpen] = useState(false);
  const [aiGenerationNotes, setAiGenerationNotes] = useState('');
  const [aiDraftStatus, setAiDraftStatus] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewSubject, setPreviewSubject] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const recipientCount = recipientStats?.sendCount ?? 0;

  useEffect(() => {
    const loadMetadata = async () => {
      setIsLoadingMeta(true);
      try {
        const [stats, photos] = await Promise.all([
          getEventMarketingRecipientStats(eventId, audience),
          fetchContentfulPhotos(),
        ]);
        setRecipientStats(stats);
        setAvailablePhotos(photos);
      } catch (error) {
        console.error('Error loading marketing email metadata:', error);
        toast.error('Failed to load marketing email metadata.');
      } finally {
        setIsLoadingMeta(false);
      }
    };

    loadMetadata();
  }, [eventId, audience]);

  const selectedPhotos = useMemo(
    () => availablePhotos.filter((photo) => selectedPhotoUrls.includes(photo.url)),
    [availablePhotos, selectedPhotoUrls]
  );

  const tiktokLinks = useMemo(
    () => socialLinks.filter((link) => link.url.trim().length > 0),
    [socialLinks]
  );

  const togglePhotoSelection = (photoUrl: string) => {
    setSelectedPhotoUrls((current) => {
      if (current.includes(photoUrl)) {
        return current.filter((value) => value !== photoUrl);
      }
      return [...current, photoUrl];
    });
  };

  const updateSocialLink = (index: number, patch: Partial<MarketingSocialLink>) => {
    setSocialLinks((current) =>
      current.map((link, linkIndex) => (linkIndex === index ? { ...link, ...patch } : link))
    );
  };

  const addSocialLink = () => {
    setSocialLinks((current) => [...current, { url: '', label: '' }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks((current) => {
      const next = current.filter((_, linkIndex) => linkIndex !== index);
      return next.length > 0 ? next : [{ url: '', label: '' }];
    });
  };

  const buildPayload = (): MarketingEmailPayload | null => {
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return null;
    }

    if (!content.trim()) {
      toast.error('Please enter email content');
      return null;
    }

    return {
      eventId,
      subject: subject.trim(),
      preMenuSummary: preMenuSummary.trim(),
      content: content.trim(),
      signOff: signOff.trim() || 'Best,',
      tiktokLinks,
      selectedPhotos,
      audience,
    };
  };

  const handleGenerateDraft = async () => {
    setIsAIPromptOpen(true);
  };

  const handleGenerateDraftFromPrompt = async () => {
    setIsGeneratingDraft(true);
    setAiDraftStatus(null);
    try {
      const draft = await generateEventMarketingAIDraftWithContext({
        eventId,
        generationNotes: aiGenerationNotes,
      });
      setSubject(draft.subject);
      setPreMenuSummary(draft.preMenuSummary);
      setContent(draft.content);
      setIsAIPromptOpen(false);
      setAiDraftStatus(
        draft.usedFallback
          ? {
              type: 'warning',
              message:
                'AI response was unavailable or incomplete. Fallback draft content was applied, so review before sending.',
            }
          : {
              type: 'success',
              message: 'AI draft generated successfully.',
            }
      );
      toast.success(
        draft.usedFallback
          ? 'Draft generated from event details (AI fallback).'
          : 'AI draft generated. Review and edit before sending.'
      );
    } catch (error) {
      console.error('Error generating AI draft:', error);
      setAiDraftStatus({
        type: 'error',
        message: 'AI draft generation failed. Your existing content was kept unchanged.',
      });
      toast.error(error instanceof Error ? error.message : 'Failed to generate AI draft');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handlePreview = async () => {
    const payload = buildPayload();
    if (!payload) {
      return;
    }

    setIsPreviewing(true);
    try {
      const result = await previewEventMarketingEmail(payload);
      setPreviewSubject(payload.subject);
      setPreviewHtml(result.html);
      if (result.stats) {
        setRecipientStats(result.stats);
      }
      setIsPreviewOpen(true);
    } catch (error) {
      console.error('Error previewing marketing email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to preview email');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleSendTest = async () => {
    const payload = buildPayload();
    if (!payload) {
      return;
    }

    setIsSendingTest(true);
    try {
      await sendEventMarketingTestEmail(payload);
      toast.success('Test email sent to sirkinsupperclub@gmail.com');
    } catch (error) {
      console.error('Error sending test marketing email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendCampaign = async () => {
    const payload = buildPayload();
    if (!payload) {
      return;
    }

    const audienceLabel =
      audience === 'all_subscribed'
        ? 'all subscribed contacts'
        : 'subscribed contacts without tickets for this event';

    const confirmed = window.confirm(
      `Send this campaign to ${recipientCount} ${audienceLabel}?\n\nOne email will be sent to sirkinsupperclub@gmail.com with everyone else BCC'd (not one email per person in your inbox).`
    );

    if (!confirmed) {
      return;
    }

    setIsSendingCampaign(true);
    try {
      const response = await sendEventMarketingCampaign(payload);
      setRecipientStats(response.stats);
      toast.success(
        `Campaign sent to ${response.recipientCount} recipients in ${response.batchesSent} outbound email(s) to your inbox.`
      );
    } catch (error) {
      console.error('Error sending marketing campaign:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send campaign');
    } finally {
      setIsSendingCampaign(false);
    }
  };

  return (
    <section className="mb-8 p-6 bg-black/20 rounded-lg border border-gold/30">
      <div className="mb-4">
        <h3 className="text-gold font-semibold text-xl">Event Marketing Email</h3>
        <p className="text-white/80 text-sm mt-1">
          For {eventTitle}. Campaign sends one email to sirkinsupperclub@gmail.com with recipients BCC&apos;d.
        </p>
      </div>

      <div className="bg-black/50 p-4 rounded border border-gold/30 mb-6">
        <p className="text-gold font-semibold mb-2">Audience</p>
        <div className="space-y-2 mb-3">
          <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
            <input
              type="radio"
              name="marketingAudience"
              checked={audience === 'all_subscribed'}
              onChange={() => setAudience('all_subscribed')}
            />
            All subscribed contacts
          </label>
          <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
            <input
              type="radio"
              name="marketingAudience"
              checked={audience === 'exclude_event_ticket_holders'}
              onChange={() => setAudience('exclude_event_ticket_holders')}
            />
            Exclude people who already bought tickets for this event
          </label>
        </div>
        <p className="text-white text-sm">
          {isLoadingMeta
            ? 'Loading recipient counts...'
            : `Will send to ${recipientCount} recipient(s)`}
        </p>
        {recipientStats && !isLoadingMeta ? (
          <p className="text-white/70 text-xs mt-2">
            {recipientStats.totalSubscribed} subscribed total ·{' '}
            {recipientStats.excludedWithEventTickets} already have tickets for this event
          </p>
        ) : null}
        <p className="text-white/70 text-xs mt-1">
          Test send always goes to sirkinsupperclub@gmail.com only
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={handleGenerateDraft}
          disabled={isGeneratingDraft}
          className="px-4 py-2 rounded bg-black text-gold border border-gold hover:bg-gold hover:text-black transition-colors"
        >
          {isGeneratingDraft ? 'Generating...' : 'Generate AI Draft'}
        </button>
      </div>

      {aiDraftStatus ? (
        <div
          className={`mb-4 rounded border p-3 text-sm ${
            aiDraftStatus.type === 'success'
              ? 'border-green-500/50 bg-green-500/10 text-green-200'
              : aiDraftStatus.type === 'warning'
                ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-200'
                : 'border-red-500/50 bg-red-500/10 text-red-200'
          }`}
        >
          {aiDraftStatus.message}
        </div>
      ) : null}

      {isAIPromptOpen ? (
        <div className="fixed inset-0 z-50 bg-black/80 p-4 overflow-y-auto">
          <div className="max-w-2xl mx-auto bg-black border-2 border-gold rounded-lg p-5">
            <div className="flex justify-between items-center border-b border-gold pb-2 mb-4">
              <h4 className="text-gold text-xl font-semibold">AI Draft Details</h4>
              <button
                onClick={() => setIsAIPromptOpen(false)}
                className="text-white hover:text-gold transition-colors"
                disabled={isGeneratingDraft}
              >
                Close
              </button>
            </div>

            <p className="text-white/80 text-sm mb-3">
              Add campaign-specific notes for this draft (optional). Useful when you run multiple
              marketing emails for the same event.
            </p>

            <textarea
              value={aiGenerationNotes}
              onChange={(event) => setAiGenerationNotes(event.target.value)}
              rows={6}
              className="w-full p-3 bg-black border border-gold/30 rounded text-white focus:outline-none focus:border-gold"
              placeholder="Example: Focus this one on first-time guests, mention limited seats for Friday, and keep the tone extra playful."
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsAIPromptOpen(false)}
                disabled={isGeneratingDraft}
                className="px-4 py-2 rounded bg-black text-gold border border-gold hover:bg-gold hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateDraftFromPrompt}
                disabled={isGeneratingDraft}
                className="px-4 py-2 rounded font-semibold bg-gold text-black hover:bg-white transition-colors"
              >
                {isGeneratingDraft ? 'Generating...' : 'Generate Draft'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-2 mb-4">
        <label htmlFor="marketingSubject" className="block text-gold font-semibold">
          Subject
        </label>
        <input
          id="marketingSubject"
          type="text"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Enter campaign subject..."
          className="w-full p-2 bg-black border border-gold/30 rounded text-white focus:outline-none focus:border-gold"
        />
      </div>

      <div className="space-y-2 mb-4">
        <label className="block text-gold font-semibold">Pre-menu summary</label>
        <RichTextEditor
          content={preMenuSummary}
          onChange={setPreMenuSummary}
          placeholder="Short intro above the menu..."
        />
      </div>

      <div className="space-y-2 mb-4">
        <label className="block text-gold font-semibold">Main body</label>
        <RichTextEditor content={content} onChange={setContent} placeholder="Main body after menu..." />
      </div>

      <div className="space-y-2 mb-4">
        <label htmlFor="signOff" className="block text-gold font-semibold">
          Sign-off
        </label>
        <input
          id="signOff"
          type="text"
          value={signOff}
          onChange={(event) => setSignOff(event.target.value)}
          className="w-full p-2 bg-black border border-gold/30 rounded text-white focus:outline-none focus:border-gold"
          placeholder="Best,"
        />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <label className="block text-gold font-semibold">TikTok links</label>
          <button
            type="button"
            onClick={addSocialLink}
            className="px-3 py-1 rounded bg-black text-gold border border-gold hover:bg-gold hover:text-black transition-colors text-sm"
          >
            Add link
          </button>
        </div>
        {socialLinks.map((link, index) => (
          <div key={`social-link-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <input
              type="text"
              value={link.url}
              onChange={(event) => updateSocialLink(index, { url: event.target.value })}
              placeholder="TikTok URL"
              className="md:col-span-6 w-full p-2 bg-black border border-gold/30 rounded text-white focus:outline-none focus:border-gold"
            />
            <input
              type="text"
              value={link.label ?? ''}
              onChange={(event) => updateSocialLink(index, { label: event.target.value })}
              placeholder="Link text / description (optional)"
              className="md:col-span-5 w-full p-2 bg-black border border-gold/30 rounded text-white focus:outline-none focus:border-gold"
            />
            <button
              type="button"
              onClick={() => removeSocialLink(index)}
              className="md:col-span-1 px-3 py-2 rounded bg-black text-red-300 border border-red-400/40 hover:bg-red-500/20 transition-colors"
            >
              X
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2 mb-6">
        <p className="block text-gold font-semibold">Contentful photos</p>
        {availablePhotos.length === 0 ? (
          <p className="text-white/70 text-sm">No Contentful photos loaded.</p>
        ) : (
          <div className="max-h-72 overflow-y-auto border border-gold/30 rounded p-3 bg-black/50 grid grid-cols-1 md:grid-cols-2 gap-3">
            {availablePhotos.map((photo) => (
              <label
                key={photo.url}
                className="border border-gold/20 rounded p-2 flex gap-3 items-start cursor-pointer hover:border-gold/60 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedPhotoUrls.includes(photo.url)}
                  onChange={() => togglePhotoSelection(photo.url)}
                  className="mt-1"
                />
                <img src={photo.url} alt={photo.title} className="h-16 w-16 object-cover rounded" />
                <div>
                  <p className="text-white text-sm font-semibold">{photo.title}</p>
                  {photo.description ? (
                    <p className="text-white/70 text-xs line-clamp-2">{photo.description}</p>
                  ) : null}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          onClick={handlePreview}
          disabled={isPreviewing}
          className="px-5 py-2 rounded font-semibold bg-black text-gold border border-gold hover:bg-gold hover:text-black transition-colors"
        >
          {isPreviewing ? 'Building Preview...' : 'Preview'}
        </button>
        <button
          onClick={handleSendTest}
          disabled={isSendingTest}
          className="px-5 py-2 rounded font-semibold bg-black text-gold border border-gold hover:bg-gold hover:text-black transition-colors"
        >
          {isSendingTest ? 'Sending Test...' : 'Send Test'}
        </button>
        <button
          onClick={handleSendCampaign}
          disabled={isSendingCampaign}
          className="px-5 py-2 rounded font-semibold bg-gold text-black hover:bg-white transition-colors"
        >
          {isSendingCampaign ? 'Sending Campaign...' : 'Send Campaign'}
        </button>
      </div>

      {isPreviewOpen ? (
        <div className="fixed inset-0 z-50 bg-black/80 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto bg-black border-2 border-gold rounded-lg p-5">
            <div className="flex justify-between items-center border-b border-gold pb-2 mb-4">
              <h4 className="text-gold text-xl font-semibold">Marketing Email Preview</h4>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-white hover:text-gold transition-colors"
              >
                Close
              </button>
            </div>
            <div className="mb-4 p-3 bg-black/50 border border-gold/30 rounded">
              <p className="text-gold text-sm">Subject</p>
              <p className="text-white">{previewSubject || '(No subject)'}</p>
            </div>
            <div className="max-h-[70vh] overflow-y-auto bg-white rounded p-2">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
