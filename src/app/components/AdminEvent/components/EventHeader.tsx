'use client';

import { formatDate } from '@/app/utils/formatDate';

interface EventHeaderProps {
  title: string;
  date: number | null;
  showEmailComposer: boolean;
  showMarketingComposer: boolean;
  onToggleEmailComposer: () => void;
  onToggleMarketingComposer: () => void;
  onResetEvent: (event: number | null) => void;
}

export function EventHeader({
  title,
  date,
  showEmailComposer,
  showMarketingComposer,
  onToggleEmailComposer,
  onToggleMarketingComposer,
  onResetEvent
}: EventHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gold">{title}</h2>
        {date && (
          <p className="text-gray-400 mt-1">
            {formatDate(new Date(date))}
          </p>
        )}
      </div>
      <div className="flex gap-4">
        <button
          onClick={onToggleMarketingComposer}
          className="bg-black text-gold px-4 py-2 rounded hover:bg-gold hover:text-black transition-colors"
        >
          {showMarketingComposer ? 'Hide Marketing Email' : 'Marketing Email'}
        </button>
        <button 
          onClick={onToggleEmailComposer}
          className="bg-black text-gold px-4 py-2 rounded hover:bg-gold hover:text-black transition-colors"
        >
          {showEmailComposer ? 'Hide Email Composer' : 'Email Attendees'}
        </button>
        <button 
          onClick={() => onResetEvent(null)} 
          className="bg-black text-gold px-4 py-2 rounded hover:bg-gold hover:text-black transition-colors"
        >
          Back to Events
        </button>
      </div>
    </div>
  );
} 