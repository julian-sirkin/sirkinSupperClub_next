'use client';

import { adminEvent } from '@/app/api/api.types';
import { formatDate } from '@/app/utils/formatDate';
import { organizeAdminEvents, OrganizedEvents } from '@/app/helpers/organizeAdminEvents';

interface AdminEventOrganizedListProps {
  events: adminEvent[];
  onEventClick: (eventId: number) => void;
}

export const AdminEventOrganizedList = ({ events, onEventClick }: AdminEventOrganizedListProps) => {
  const organizedEvents = organizeAdminEvents(events);

  const renderEventTable = (eventList: adminEvent[], title: string, emptyMessage: string) => {
    if (eventList.length === 0) {
      return null;
    }

    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gold">{title}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-black/50 rounded-lg overflow-hidden">
            <thead className="bg-gold text-black">
              <tr>
                <th className="py-3 px-4 text-left">Event</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Tickets Available</th>
                <th className="py-3 px-4 text-left">Tickets Sold</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {eventList.map((event) => (
                <tr key={event.id} className="text-white hover:bg-black/70">
                  <td className="py-3 px-4">{event.title}</td>
                  <td className="py-3 px-4">{formatDate(new Date(event.date))}</td>
                  <td className="py-3 px-4">{event.ticketsAvailable}</td>
                  <td className="py-3 px-4">{event.ticketsSold}</td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => onEventClick(event.id)} 
                      className="bg-gold text-black px-3 py-1 rounded hover:bg-white transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (events.length === 0) {
    return (
      <div className="text-center p-8 text-white">
        No events found. Try syncing events first.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gold">Events</h2>
      
      {/* Upcoming Events */}
      {renderEventTable(
        organizedEvents.upcomingEvents,
        'Upcoming Events',
        'No upcoming events'
      )}

      {/* Past Events by Year */}
      {Object.keys(organizedEvents.pastEventsByYear)
        .sort((a, b) => parseInt(b) - parseInt(a)) // Sort years descending (newest first)
        .map((year) => 
          renderEventTable(
            organizedEvents.pastEventsByYear[year],
            year,
            `No events in ${year}`
          )
        )}
    </div>
  );
}; 