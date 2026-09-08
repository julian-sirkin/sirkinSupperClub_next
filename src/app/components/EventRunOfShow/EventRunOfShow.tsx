'use client'
import { useEffect, useState } from 'react';
import { fetchEventData } from '@/app/components/AdminEvent/services/eventService';
import { getCachedEvent } from '@/app/admin/adminDataCache';
import { buildEventRunOfShow, EventRunOfShow as EventRunOfShowData } from '@/app/helpers/buildEventRunOfShow';
import { EventRunOfShowUI } from './EventRunOfShowUI';
import Link from 'next/link';

function buildFromEventData(eventId: number): EventRunOfShowData | null {
  const cached = getCachedEvent(eventId);
  if (!cached) {
    return null;
  }

  return buildEventRunOfShow({
    title: cached.title,
    date: cached.date,
    tickets: cached.tickets,
  });
}

export function EventRunOfShowPage({ eventId }: { eventId: number }) {
  const [runOfShow, setRunOfShow] = useState<EventRunOfShowData | null>(() => buildFromEventData(eventId));
  const [isLoading, setIsLoading] = useState(() => !getCachedEvent(eventId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const cached = getCachedEvent(eventId);
      if (!cached) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await fetchEventData(eventId);
        if (cancelled) {
          return;
        }

        setRunOfShow(buildEventRunOfShow({
          title: data.title,
          date: data.date,
          tickets: data.tickets,
        }));
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        const message = loadError instanceof Error ? loadError.message : 'Failed to load event summary';
        setError(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const backLinkClass =
    'bg-black text-gold px-4 py-3 rounded hover:bg-gold hover:text-black transition-colors min-h-[44px] inline-flex items-center justify-center';

  if (isLoading && !runOfShow) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (error || !runOfShow) {
    return (
      <div className="text-center p-8 text-white bg-black/50 rounded-lg">
        <p className="text-red-400 mb-4">{error || 'Event not found'}</p>
        <Link href={`/admin/events/${eventId}`} className={backLinkClass}>
          Back to event
        </Link>
      </div>
    );
  }

  return <EventRunOfShowUI eventId={eventId} runOfShow={runOfShow} />;
}
