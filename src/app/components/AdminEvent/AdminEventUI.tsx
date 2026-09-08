'use client';

import { TicketWithPurchases } from '@/app/api/api.types';
import Link from 'next/link';
import { EventHeader } from './components/EventHeader';
import { EventConfirmationEmailSection } from './components/EventConfirmationEmailSection';
import { EventEmailSection } from './components/EventEmailSection';
import { EventMarketingEmailSection } from './components/EventMarketingEmailSection';
import { EventTicketsList } from './components/EventTicketsList';

interface AdminEventUIProps {
  eventId: number;
  eventData: TicketWithPurchases[];
  eventTitle: string;
  eventDate: number | null;
  isLoading: boolean;
  error: string | null;
  showEmailComposer: boolean;
  showMarketingComposer: boolean;
  recipientEmails: string[];
  onToggleEmailComposer: () => void;
  onToggleMarketingComposer: () => void;
  onRefund: (message: string) => void;
  onSendEmail: (subject: string, content: string) => Promise<void>;
  onRetry: () => void;
}

const backLinkClass =
  'bg-black text-gold px-4 py-3 rounded hover:bg-gold hover:text-black transition-colors min-h-[44px] inline-flex items-center justify-center';

export function AdminEventUI({
  eventId,
  eventData,
  eventTitle,
  eventDate,
  isLoading,
  error,
  showEmailComposer,
  showMarketingComposer,
  recipientEmails,
  onToggleEmailComposer,
  onToggleMarketingComposer,
  onRefund,
  onSendEmail,
  onRetry
}: AdminEventUIProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black/30 rounded-lg p-4">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6">
          <h2 className="text-2xl font-bold text-gold">Error Loading Event</h2>
          <Link href="/admin/events" className={backLinkClass}>
            Back to Events
          </Link>
        </div>
        <div className="text-center p-8 text-white bg-black/50 rounded-lg">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={onRetry} 
            className="bg-gold text-black px-4 py-3 rounded hover:bg-white transition-colors min-h-[44px]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/30 rounded-lg p-4">
      <EventHeader
        eventId={eventId}
        title={eventTitle}
        date={eventDate}
        showEmailComposer={showEmailComposer}
        showMarketingComposer={showMarketingComposer}
        onToggleEmailComposer={onToggleEmailComposer}
        onToggleMarketingComposer={onToggleMarketingComposer}
      />

      {showMarketingComposer && (
        <EventMarketingEmailSection
          eventId={eventId}
          eventTitle={eventTitle}
        />
      )}

      {showEmailComposer && (
        <EventEmailSection
          recipientEmails={recipientEmails}
          onSendEmail={onSendEmail}
        />
      )}
      
      <EventConfirmationEmailSection eventId={eventId} eventTitle={eventTitle} />

      <EventTicketsList
        tickets={eventData}
        onRefund={onRefund}
      />
    </div>
  );
}
