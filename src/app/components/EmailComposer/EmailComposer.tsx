'use client';

import { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { toast } from 'react-toastify';
import { wrapEmailContent } from '@/app/utils/emailTemplate';

interface EmailComposerProps {
  onSend: (subject: string, content: string) => Promise<void>;
  recipientCount: number;
  recipientDescription: string;
}

export function EmailComposer({ onSend, recipientCount, recipientDescription }: EmailComposerProps) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [signOff, setSignOff] = useState('Best,');
  const [isSending, setIsSending] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    setIsSending(true);
    try {
      const wrappedContent = wrapEmailContent(content, signOff);
      await onSend(subject, wrappedContent);
      toast.success('Email sent successfully!');
      // Clear the form
      setSubject('');
      setContent('');
      setSignOff('Best,');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
    // Create and show the preview dialog
    const previewDialog = document.createElement('dialog');
    previewDialog.id = 'email-preview-dialog';
    previewDialog.className = 'bg-transparent p-0 backdrop:bg-black/70 backdrop:backdrop-blur-sm';
    
    const wrappedContent = wrapEmailContent(content, signOff);
    
    previewDialog.innerHTML = `
      <div class="bg-black border-2 border-gold text-white w-[90vw] max-w-4xl p-4 md:p-6 rounded-lg shadow-2xl">
        <div class="flex justify-between items-center mb-4 border-b border-gold pb-2">
          <h2 class="text-2xl md:text-3xl font-bold text-gold">
            Email Preview
          </h2>
          <button 
            onclick="this.closest('dialog').close()"
            class="text-white hover:text-gold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="mb-4 p-4 bg-black/50 rounded border border-gold/30">
          <p class="text-gold font-semibold mb-2">Subject:</p>
          <p class="text-white">${subject || '(No subject)'}</p>
        </div>
        <div class="preview-content overflow-y-auto max-h-[70vh]">
          ${wrappedContent}
        </div>
      </div>
    `;

    document.body.appendChild(previewDialog);
    previewDialog.showModal();

    // Clean up when dialog is closed
    previewDialog.addEventListener('close', () => {
      document.body.removeChild(previewDialog);
      setIsPreviewOpen(false);
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-black p-4 rounded-lg border border-gold/30 mb-6">
        <h3 className="text-gold font-semibold mb-2">Recipients</h3>
        <p className="text-white">
          This email will be sent to {recipientCount} {recipientDescription}
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="block text-gold font-semibold">
          Subject
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-2 bg-black border border-gold/30 rounded text-white focus:outline-none focus:border-gold"
          placeholder="Enter email subject..."
          disabled={isSending}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-gold font-semibold">
          Content
        </label>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Compose your email..."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="signOff" className="block text-gold font-semibold">
          Sign-off
        </label>
        <input
          id="signOff"
          type="text"
          value={signOff}
          onChange={(e) => setSignOff(e.target.value)}
          className="w-full p-2 bg-black border border-gold/30 rounded text-white focus:outline-none focus:border-gold"
          placeholder="Enter sign-off..."
          disabled={isSending}
        />
      </div>

      <div className="flex justify-end gap-4 mt-4">
        <button
          onClick={handlePreview}
          disabled={isSending}
          className="px-6 py-2 rounded font-semibold bg-black text-gold border border-gold hover:bg-gold hover:text-black transition-colors"
        >
          Preview
        </button>
        <button
          onClick={handleSend}
          disabled={isSending}
          className={`px-6 py-2 rounded font-semibold transition-colors ${
            isSending
              ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
              : 'bg-gold text-black hover:bg-white'
          }`}
        >
          {isSending ? 'Sending...' : 'Send Email'}
        </button>
      </div>
    </div>
  );
} 