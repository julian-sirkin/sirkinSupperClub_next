'use client'
import { useState } from 'react';
import CustomerSection from '../adminPannelSections/CustomerSection';
import EventData from '../adminPannelSections/EventData';

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState<'customers' | 'events'>('customers');

  const handleMergeEventsToDatabase = async () => {
    console.log('Merge Events to Database')
    const response = await fetch('api/addEvent', {
        method: 'POST',
        headers: {
            Accept: "application/json",
            'Content-Type': 'application/json',
        },
    })

    const data = await response.json()
    console.log(data, 'data')
  }

  return (
    <div className="admin-panel">
      <header>
        <h1>Admin Panel</h1>
      </header>
      <nav>
        <button onClick={handleMergeEventsToDatabase}>Merge Events to Database</button>
        <button onClick={() => setActiveSection('customers')}>Customers</button>
        <button onClick={() => setActiveSection('events')}>Events</button>
      </nav>
      <main className=''>
        {activeSection === 'customers' && <CustomerSection />}
        {activeSection === 'events' && <EventData />}
      </main>
    </div>
  );
};

export default AdminPanel;
