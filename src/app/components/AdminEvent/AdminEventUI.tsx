'use client';

import { TicketWithPurchases } from '@/app/api/api.types';
import { EventHeader } from './components/EventHeader';
import { EventEmailSection } from './components/EventEmailSection';
import { EventTicketsList } from './components/EventTicketsList';

interface AdminEventUIProps {
  eventData: TicketWithPurchases[];
  eventTitle: string;
  eventDate: number | null;
  isLoading: boolean;
  error: string | null;
  showEmailComposer: boolean;
  recipientEmails: string[];
  onToggleEmailComposer: () => void;
  onResetEvent: (event: number | null) => void;
  onRefund: (message: string) => void;
  onSendEmail: (subject: string, content: string) => Promise<void>;
  onRetry: () => void;
}

export function AdminEventUI({
  eventData,
  eventTitle,
  eventDate,
  isLoading,
  error,
  showEmailComposer,
  recipientEmails,
  onToggleEmailComposer,
  onResetEvent,
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gold">Error Loading Event</h2>
          <button 
            onClick={() => onResetEvent(null)} 
            className="bg-black text-gold px-4 py-2 rounded hover:bg-gold hover:text-black transition-colors"
          >
            Back to Events
          </button>
        </div>
        <div className="text-center p-8 text-white bg-black/50 rounded-lg">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={onRetry} 
            className="bg-gold text-black px-4 py-2 rounded hover:bg-white transition-colors"
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
        title={eventTitle}
        date={eventDate}
        showEmailComposer={showEmailComposer}
        onToggleEmailComposer={onToggleEmailComposer}
        onResetEvent={onResetEvent}
      />

      {showEmailComposer && (
        <EventEmailSection
          recipientEmails={recipientEmails}
          onSendEmail={onSendEmail}
        />
      )}
      
      <EventTicketsList
        tickets={eventData}
        onRefund={onRefund}
      />
    </div>
  );
} 