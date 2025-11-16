'use client'
import CustomerSection from '@/app/adminPannelSections/CustomerSection';
import EventData from '@/app/adminPannelSections/EventData';
import { adminEvent } from '@/app/api/api.types';
import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { syncEvents } from '@/app/utils/syncEvents';
import 'react-toastify/dist/ReactToastify.css';
import { EmailSection } from '../EmailSection/EmailSection';
import { TestEmailSection } from '../TestEmailSection/TestEmailSection';

export const AdminLayout = ({adminEvents}: {adminEvents?: adminEvent[]}) => {
    const [activeSection, setActiveSection] = useState<'customers' | 'events' | 'email' | 'test-email'>('customers');
    const [eventSelected, setEventSelected] = useState<number | null>(null);
    const [customerSelected, setCustomerSelected] = useState<number | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    // Check URL for view parameter on initial load and when URL changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const view = params.get('view');
            const id = params.get('id');
            
            if (view === 'customer') {
                setActiveSection('customers');
                setEventSelected(null);
                setCustomerSelected(id ? Number(id) : null);
            } else if (view === 'email') {
                setActiveSection('email');
                setEventSelected(null);
                setCustomerSelected(null);
            } else if (view === 'event') {
                setActiveSection('events');
                setEventSelected(id ? Number(id) : null);
                setCustomerSelected(null);
            } else if (view === 'test-email') {
                setActiveSection('test-email');
                setEventSelected(null);
                setCustomerSelected(null);
            } else {
                // Default to events if no view specified
                setActiveSection('events');
                setEventSelected(id ? Number(id) : null);
                setCustomerSelected(null);
            }
        }
        
        // Add event listener for URL changes (back/forward navigation)
        const handleUrlChange = () => {
            const params = new URLSearchParams(window.location.search);
            const view = params.get('view');
            const id = params.get('id');
            
            if (view === 'customer') {
                setActiveSection('customers');
                setEventSelected(null);
                setCustomerSelected(id ? Number(id) : null);
            } else if (view === 'email') {
                setActiveSection('email');
                setEventSelected(null);
                setCustomerSelected(null);
            } else if (view === 'event' || !view) {
                setActiveSection('events');
                setEventSelected(id ? Number(id) : null);
                setCustomerSelected(null);
            } else if (view === 'test-email') {
                setActiveSection('test-email');
                setEventSelected(null);
                setCustomerSelected(null);
            }
        };
        
        window.addEventListener('popstate', handleUrlChange);
        
        return () => {
            window.removeEventListener('popstate', handleUrlChange);
        };
    }, []);

    const handleSyncEvents = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        
        try {
            const success = await syncEvents(() => {
                console.log("Refreshing page after successful sync");
                window.location.reload();
            });
            
            if (success) {
                console.log("Sync successful, page will refresh soon");
                setTimeout(() => {
                    if (isSyncing) {
                        console.log("Backup timeout: resetting syncing state");
                        setIsSyncing(false);
                        window.location.reload();
                    }
                }, 5000);
            } else {
                console.log("Sync failed, resetting UI state");
                setIsSyncing(false);
            }
        } catch (error) {
            console.error("Error in sync process:", error);
            setIsSyncing(false);
            toast.error("Unexpected error during sync process");
        }
    };

    const handleSectionChange = (section: 'customers' | 'events' | 'email' | 'test-email') => {
        setActiveSection(section);
        
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            
            if (section === 'customers') {
                url.searchParams.set('view', 'customer');
                // Keep customer ID if switching to customers
                if (customerSelected) {
                    url.searchParams.set('id', customerSelected.toString());
                } else {
                    url.searchParams.delete('id');
                }
            } else if (section === 'email') {
                url.searchParams.set('view', 'email');
                url.searchParams.delete('id');
            } else if (section === 'test-email') {
                url.searchParams.set('view', 'test-email');
                url.searchParams.delete('id');
            } else {
                url.searchParams.delete('view');
                // Keep event ID if switching to events
                if (eventSelected) {
                    url.searchParams.set('id', eventSelected.toString());
                } else {
                    url.searchParams.delete('id');
                }
            }
            
            window.history.pushState({}, '', url);
        }
    };

    const handleEventClick = (eventId: number | null) => {
        setEventSelected(eventId);
        setCustomerSelected(null);
        
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('view', 'event');
            if (eventId) {
                url.searchParams.set('id', eventId.toString());
            } else {
                url.searchParams.delete('id');
            }
            window.history.pushState({}, '', url);
        }
    };

    const handleCustomerClick = (customerId: number | null) => {
        setCustomerSelected(customerId);
        setEventSelected(null);
        
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('view', 'customer');
            if (customerId) {
                url.searchParams.set('id', customerId.toString());
            } else {
                url.searchParams.delete('id');
            }
            window.history.pushState({}, '', url);
        }
    };

    return (
        <div className="admin-panel p-6 max-w-7xl mx-auto">
            <ToastContainer position="top-right" autoClose={3000} />
            <header className="mb-8">
                <h1 className="text-center text-4xl font-bold text-gold mb-2">Admin Panel</h1>
                <p className="text-center text-gray-400">Manage events, tickets, and customer data</p>
            </header>
            
            <div className='flex flex-col md:flex-row gap-6'>
                <nav className='flex md:flex-col justify-start gap-4 md:w-64 p-4 bg-black/20 rounded-lg'>
                    <button 
                        className={`bg-black text-gold p-3 rounded-lg hover:bg-gold hover:text-black transition-colors shadow-md ${
                            isSyncing ? 'opacity-50 cursor-not-allowed' : ''
                        }`} 
                        onClick={handleSyncEvents}
                        disabled={isSyncing}
                    >
                        {isSyncing ? 'Syncing...' : 'Sync Events'}
                    </button>
                    <button 
                        className={`p-3 rounded-lg shadow-md transition-colors ${activeSection === 'customers' ? 'bg-gold text-black' : 'bg-black text-gold hover:bg-gold hover:text-black'}`} 
                        onClick={() => handleSectionChange('customers')}
                    >
                        Customers
                    </button>
                    <button 
                        className={`p-3 rounded-lg shadow-md transition-colors ${activeSection === 'events' ? 'bg-gold text-black' : 'bg-black text-gold hover:bg-gold hover:text-black'}`} 
                        onClick={() => handleSectionChange('events')}
                    >
                        Events
                    </button>
                    <button 
                        className={`p-3 rounded-lg shadow-md transition-colors ${activeSection === 'email' ? 'bg-gold text-black' : 'bg-black text-gold hover:bg-gold hover:text-black'}`} 
                        onClick={() => handleSectionChange('email')}
                    >
                        Email All
                    </button>
                    <button 
                        className={`p-3 rounded-lg shadow-md transition-colors ${activeSection === 'test-email' ? 'bg-gold text-black' : 'bg-black text-gold hover:bg-gold hover:text-black'}`} 
                        onClick={() => handleSectionChange('test-email')}
                    >
                        Send Email
                    </button>
                </nav>
                
                <main className='flex-1 bg-black/20 p-6 rounded-lg'>
                    {activeSection === 'customers' && (
                        <CustomerSection 
                            selectedCustomerId={customerSelected}
                            onCustomerSelect={handleCustomerClick}
                            onEventClick={handleEventClick}
                        />
                    )}
                    {activeSection === 'events' && (
                        <EventData 
                            events={adminEvents} 
                            handleEventClick={handleEventClick} 
                            eventSelected={eventSelected}
                            onCustomerClick={handleCustomerClick}
                        />
                    )}
                    {activeSection === 'email' && <EmailSection />}
                    {activeSection === 'test-email' && <TestEmailSection />}
                </main>
            </div>
        </div>
    );
};