'use client';

import { EmailComposer } from '../../EmailComposer/EmailComposer';

interface EventEmailSectionProps {
  recipientEmails: string[];
  onSendEmail: (subject: string, content: string) => Promise<void>;
}

export function EventEmailSection({
  recipientEmails,
  onSendEmail
}: EventEmailSectionProps) {
  return (
    <div className="mb-8 p-6 bg-black/20 rounded-lg border border-gold/30">
      <div className="mb-6">
        <h3 className="text-gold font-semibold mb-2">Recipients</h3>
        <div className="bg-black/50 p-4 rounded border border-gold/30 max-h-32 overflow-y-auto">
          <p className="text-white">
            {recipientEmails.join(', ')}
          </p>
        </div>
      </div>
      <EmailComposer
        onSend={onSendEmail}
        recipientCount={recipientEmails.length}
        recipientDescription="attendees"
      />
    </div>
  );
} 