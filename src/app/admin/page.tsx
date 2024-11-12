'use client'
import { useState } from 'react';
import CustomerSection from '../adminPannelSections/CustomerSection';
import EventData from '../adminPannelSections/EventData';

const AdminPanel = () => {
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

  const handleClickEvent = (event: string) => {

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
        {activeSection === 'events' && <EventData  handleEventClick={setEventSelected} eventSelected={eventSelected}/>}
      </main>
      </div>
    </div>
  );
};

export default AdminPanel;
