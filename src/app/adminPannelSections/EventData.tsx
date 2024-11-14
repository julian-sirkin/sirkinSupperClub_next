import React from 'react';
import { EventsTable } from '../components/EventsTable/EventsTable';
import { AdminEvent } from '../components/AdminEvent/AdminEvent';
import { getAllAdminEvents } from '../api/queries/select';
import { adminEvent } from '../api/api.types';

const EventData = ({handleEventClick, eventSelected, events}: {handleEventClick: (event: number | null) => void, eventSelected: number | null, events: adminEvent[] | undefined}) => {
  return (
    <div>
      <h2>Event Data</h2>
     {eventSelected ? <AdminEvent eventId={eventSelected} resetEvent={handleEventClick}/> : <EventsTable events={events} handleEventClick={handleEventClick}/>} 
    </div>
  );
};

export default EventData;
