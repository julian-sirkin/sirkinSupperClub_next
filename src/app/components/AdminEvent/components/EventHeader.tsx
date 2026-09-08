'use client';

import { formatDate } from '@/app/utils/formatDate';
import Link from 'next/link';

interface EventHeaderProps {
  eventId: number;
  title: string;
  date: number | null;
  showEmailComposer: boolean;
  showMarketingComposer: boolean;
  onToggleEmailComposer: () => void;
  onToggleMarketingComposer: () => void;
}

const actionClass =
  'bg-black text-gold px-4 py-3 rounded hover:bg-gold hover:text-black transition-colors min-h-[44px] inline-flex items-center justify-center';

export function EventHeader({
  eventId,
  title,
  date,
  showEmailComposer,
  showMarketingComposer,
  onToggleEmailComposer,
  onToggleMarketingComposer
}: EventHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-6 md:flex-row md:justify-between md:items-start">
      <div>
        <h2 className="text-2xl font-bold text-gold">{title}</h2>
        {date && (
          <p className="text-gray-400 mt-1">
            {formatDate(new Date(date))}
          </p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <button
          type="button"
          onClick={onToggleMarketingComposer}
          className={actionClass}
        >
          {showMarketingComposer ? 'Hide Marketing Email' : 'Marketing Email'}
        </button>
        <button
          type="button"
          onClick={onToggleEmailComposer}
          className={actionClass}
        >
          {showEmailComposer ? 'Hide Email Composer' : 'Email Attendees'}
        </button>
        <Link href={`/admin/events/${eventId}/run-of-show`} className={actionClass}>
          Run of show
        </Link>
        <Link href="/admin/events" className={actionClass}>
          Back to Events
        </Link>
      </div>
    </div>
  );
}
