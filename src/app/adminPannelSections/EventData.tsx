'use client'
import { AdminEvent } from "../components/AdminEvent/AdminEvent";
import { AdminEventOrganizedList } from "../components/AdminEvent/AdminEventOrganizedList";
import { adminEvent } from "../api/api.types";

export default function EventData({ 
    events, 
    eventSelected,
}: { 
    events?: adminEvent[], 
    eventSelected: number | null,
}) {
    if (!events || events.length === 0) {
        return <div className="text-center p-8 text-white">No events found. Try syncing events first.</div>;
    }

    if (eventSelected) {
        return <AdminEvent eventId={eventSelected} />;
    }

    return (
        <AdminEventOrganizedList 
            events={events} 
        />
    );
}
