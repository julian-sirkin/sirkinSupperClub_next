'use client';

import { useState } from 'react';
import { ConfirmationEmailEditor } from '../../ConfirmationEmailEditor/ConfirmationEmailEditor';

interface EventConfirmationEmailSectionProps {
  eventId: number;
  eventTitle: string;
}

export function EventConfirmationEmailSection({
  eventId,
  eventTitle
}: EventConfirmationEmailSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-8 p-6 bg-black/20 rounded-lg border border-gold/30">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="text-gold font-semibold">Confirmation Email</h3>
          <p className="text-gray-400 text-sm">
            Write a different confirmation email just for this event.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 rounded font-semibold bg-black text-gold border border-gold hover:bg-gold hover:text-black transition-colors"
          type="button"
        >
          {isOpen ? 'Hide' : 'Customize'}
        </button>
      </div>

      {isOpen && (
        <div className="mt-6">
          <ConfirmationEmailEditor eventId={eventId} eventTitle={eventTitle} />
        </div>
      )}
    </div>
  );
}
