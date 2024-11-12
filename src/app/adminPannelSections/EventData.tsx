"use client"
import React from 'react';
import { EventsTable } from '../components/EventsTable/EventsTable';
import { AdminEvent } from '../components/AdminEvent/AdminEvent';

const EventData = ({handleEventClick, eventSelected}: {handleEventClick: (event: number | null) => void, eventSelected: number | null}) => {
  const events = [
    {id: 1, name: 'Upcoming Event', date: '2024-11-12T00:53:03+00:00', ticketsAvailable: 24, ticketsSold: 8},
    {id: 2, name: 'Upcoming Event 2', date: '2024-11-12T00:53:03+00:00', ticketsAvailable: 24, ticketsSold: 2},
    {id: 3, name: 'Upcoming Event 2', date: '2024-11-12T00:53:03+00:00', ticketsAvailable: 24, ticketsSold: 4},
    {id: 4, name: 'Upcoming Event 2', date: '2024-11-12T00:53:03+00:00', ticketsAvailable: 24, ticketsSold: 3}
  ]


  return (
    <div>
      <h2>Event Data</h2>
     {eventSelected ? <AdminEvent eventId={eventSelected} resetEvent={handleEventClick}/> : <EventsTable events={events} handleEventClick={handleEventClick}/>} 
    </div>
  );
};

export default EventData;
