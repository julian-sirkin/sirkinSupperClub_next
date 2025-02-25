'use client'
import { AdminEvent } from "../components/AdminEvent/AdminEvent";
import { adminEvent } from "../api/api.types";
import { formatDate } from "../utils/formatDate";

export default function EventData({ 
    events, 
    handleEventClick, 
    eventSelected 
}: { 
    events?: adminEvent[], 
    handleEventClick: (eventId: number | null) => void,
    eventSelected: number | null
}) {
    if (!events || events.length === 0) {
        return <div className="text-center p-8 text-white">No events found. Try syncing events first.</div>;
    }

    if (eventSelected) {
        return <AdminEvent eventId={eventSelected} resetEvent={handleEventClick} />;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gold">Events</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-black/50 rounded-lg overflow-hidden">
                    <thead className="bg-gold text-black">
                        <tr>
                            <th className="py-3 px-4 text-left">Event</th>
                            <th className="py-3 px-4 text-left">Date</th>
                            <th className="py-3 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {events.map((event) => (
                            <tr key={event.id} className="text-white hover:bg-black/70">
                                <td className="py-3 px-4">{event.title}</td>
                                <td className="py-3 px-4">{formatDate(new Date(event.date))}</td>
                                <td className="py-3 px-4">
                                    <button 
                                        onClick={() => handleEventClick(event.id)} 
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
}
