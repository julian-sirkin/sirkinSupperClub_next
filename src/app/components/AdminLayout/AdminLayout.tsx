'use client'
import CustomerSection from '@/app/adminPannelSections/CustomerSection';
import EventData from '@/app/adminPannelSections/EventData';
import { adminEvent } from '@/app/api/api.types';
import { useState, useEffect } from 'react';

export const AdminLayout = ({adminEvents}: {adminEvents?: adminEvent[]}) => {
    const [activeSection, setActiveSection] = useState<'customers' | 'events'>('events');
    const [eventSelected, setEventSelected] = useState<number | null>(null)

    const handleMergeEventsToDatabase = async () => {
        const response = await fetch('api/addEvent', {
            method: 'POST',
            headers: {
                Accept: "application/json",
                'Content-Type': 'application/json',
            },
        })
    
        const data = await response.json()
      }

    return (
        <div className="admin-panel">
        <header>
          <h1 className="text-center text-3xl">Admin Panel</h1>
        </header>
        <div className='flex gap-4'>
        <nav className='flex flex-col justify-start gap-4'>
          <button  className="bg-black text-gold w-32 p-2 hover:bg-gold hover:text-black" onClick={handleMergeEventsToDatabase}>Merge Events to Database</button>
          <button className="bg-black text-gold w-32 p-2 hover:bg-gold hover:text-black" onClick={() => setActiveSection('customers')}>Customers</button>
          <button className="bg-black text-gold w-32 p-2 hover:bg-gold hover:text-black" onClick={() => setActiveSection('events')}>Events</button>
        </nav>
        <main className=''>
          {activeSection === 'customers' && <CustomerSection />}
          {activeSection === 'events' && <EventData events={adminEvents}  handleEventClick={setEventSelected} eventSelected={eventSelected}/>}
        </main>
        </div>
      </div>
    )
}