'use client'
import CustomerSection from '@/app/adminPannelSections/CustomerSection';
import EventData from '@/app/adminPannelSections/EventData';
import { adminEvent } from '@/app/api/api.types';
import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { syncEvents } from '@/app/utils/syncEvents';
import 'react-toastify/dist/ReactToastify.css';

export const AdminLayout = ({adminEvents}: {adminEvents?: adminEvent[]}) => {
    const [activeSection, setActiveSection] = useState<'customers' | 'events'>('events');
    const [eventSelected, setEventSelected] = useState<number | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    // Check URL for view parameter on initial load and when URL changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const view = params.get('view');
            
            if (view === 'customer') {
                setActiveSection('customers');
            } else if (view === 'event') {
                setActiveSection('events');
                const eventId = params.get('id');
                if (eventId) {
                    setEventSelected(Number(eventId));
                }
            }
        }
        
        // Add event listener for URL changes (back/forward navigation)
        const handleUrlChange = () => {
            const params = new URLSearchParams(window.location.search);
            const view = params.get('view');
            
            if (view === 'customer') {
                setActiveSection('customers');
            } else if (view === 'event' || !view) {
                setActiveSection('events');
                const eventId = params.get('id');
                setEventSelected(eventId ? Number(eventId) : null);
            }
        };
        
        window.addEventListener('popstate', handleUrlChange);
        
        return () => {
            window.removeEventListener('popstate', handleUrlChange);
        };
    }, []);

    const handleSyncEvents = async () => {
        if (isSyncing) return; // Prevent multiple simultaneous syncs
        
        setIsSyncing(true);
        
        try {
            // Only refresh the page if sync was successful
            const success = await syncEvents(() => {
                // This will only be called on success after the delay
                console.log("Refreshing page after successful sync");
                window.location.reload();
            });
            
            if (success) {
                console.log("Sync successful, page will refresh soon");
                // Set a backup timeout to ensure UI doesn't get stuck
                setTimeout(() => {
                    if (isSyncing) {
                        console.log("Backup timeout: resetting syncing state");
                        setIsSyncing(false);
                        window.location.reload();
                    }
                }, 5000); // Backup timeout longer than the expected refresh delay
            } else {
                console.log("Sync failed, resetting UI state");
                setIsSyncing(false); // Reset syncing state immediately on error
            }
        } catch (error) {
            console.error("Error in sync process:", error);
            setIsSyncing(false); // Ensure we reset state if there's an unexpected error
            toast.error("Unexpected error during sync process");
        }
    };

    const handleSectionChange = (section: 'customers' | 'events') => {
        setActiveSection(section);
        
        // Update URL when changing sections
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            
            if (section === 'customers') {
                url.searchParams.set('view', 'customer');
                // Keep the customer ID if it exists
                if (!url.searchParams.has('id')) {
                    url.searchParams.delete('id');
                }
            } else {
                url.searchParams.delete('view');
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
                </nav>
                
                <main className='flex-1 bg-black/20 p-6 rounded-lg'>
                    {activeSection === 'customers' && <CustomerSection />}
                    {activeSection === 'events' && <EventData 
                        events={adminEvents} 
                        handleEventClick={setEventSelected} 
                        eventSelected={eventSelected}
                    />}
                </main>
            </div>
        </div>
    );
};