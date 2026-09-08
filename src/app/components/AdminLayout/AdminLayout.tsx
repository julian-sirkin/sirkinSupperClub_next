'use client'
import ConfirmationEmailSection from '@/app/adminPannelSections/ConfirmationEmailSection';
import CustomerSection from '@/app/adminPannelSections/CustomerSection';
import EventData from '@/app/adminPannelSections/EventData';
import { adminEvent } from '@/app/api/api.types';
import { useCallback, useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { syncEvents } from '@/app/utils/syncEvents';
import 'react-toastify/dist/ReactToastify.css';
import { EmailSection } from '../EmailSection/EmailSection';
import { TestEmailSection } from '../TestEmailSection/TestEmailSection';
import { AdminSection, buildAdminUrl, resolveAdminView, sectionKeepsSelectedId } from './adminView';

const NAV_ITEMS: { section: AdminSection; label: string }[] = [
    { section: 'customers', label: 'Customers' },
    { section: 'events', label: 'Events' },
    { section: 'email', label: 'Email All' },
    { section: 'test-email', label: 'Send Email' },
    { section: 'confirmation-email', label: 'Confirmation Email' },
];

export const AdminLayout = ({adminEvents}: {adminEvents?: adminEvent[]}) => {
    const [activeSection, setActiveSection] = useState<AdminSection>('events');
    const [eventSelected, setEventSelected] = useState<number | null>(null);
    const [customerSelected, setCustomerSelected] = useState<number | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const applyUrlToState = useCallback(() => {
        const params = new URLSearchParams(window.location.search);
        const { activeSection: section, eventSelected: event, customerSelected: customer } =
            resolveAdminView(params.get('view'), params.get('id'));

        setActiveSection(section);
        setEventSelected(event);
        setCustomerSelected(customer);
    }, []);

    // Keeps the panel in sync with the URL on first load and on back/forward navigation.
    useEffect(() => {
        applyUrlToState();
        window.addEventListener('popstate', applyUrlToState);

        return () => {
            window.removeEventListener('popstate', applyUrlToState);
        };
    }, [applyUrlToState]);

    const pushUrl = (section: AdminSection, id: number | null) => {
        window.history.pushState(
            {},
            '',
            buildAdminUrl({ currentUrl: window.location.href, section, id })
        );
    };

    const handleSyncEvents = async () => {
        if (isSyncing) return;
        setIsSyncing(true);

        try {
            const success = await syncEvents(() => {
                window.location.reload();
            });

            if (success) {
                setTimeout(() => {
                    if (isSyncing) {
                        setIsSyncing(false);
                        window.location.reload();
                    }
                }, 5000);
            } else {
                setIsSyncing(false);
            }
        } catch (error) {
            console.error("Error in sync process:", error);
            setIsSyncing(false);
            toast.error("Unexpected error during sync process");
        }
    };

    const handleSectionChange = (section: AdminSection) => {
        setActiveSection(section);

        if (!sectionKeepsSelectedId(section)) {
            pushUrl(section, null);
            return;
        }

        pushUrl(section, section === 'customers' ? customerSelected : eventSelected);
    };

    const handleEventClick = (eventId: number | null) => {
        setEventSelected(eventId);
        setCustomerSelected(null);
        setActiveSection('events');
        pushUrl('events', eventId);
    };

    const handleCustomerClick = (customerId: number | null) => {
        setCustomerSelected(customerId);
        setEventSelected(null);
        setActiveSection('customers');
        pushUrl('customers', customerId);
    };

    return (
        <div className="admin-panel p-6 max-w-7xl mx-auto">
            <ToastContainer position="top-right" autoClose={3000} />
            <header className="mb-8">
                <h1 className="text-center text-4xl font-bold text-gold mb-2">Admin Panel</h1>
                <p className="text-center text-gray-400">Manage events, tickets, and customer data</p>
            </header>

            <div className='flex flex-col md:flex-row gap-6'>
                <nav className='flex md:flex-col flex-wrap justify-start gap-4 md:w-64 p-4 bg-black/20 rounded-lg'>
                    <button
                        className={`bg-black text-gold p-3 rounded-lg hover:bg-gold hover:text-black transition-colors shadow-md ${
                            isSyncing ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={handleSyncEvents}
                        disabled={isSyncing}
                    >
                        {isSyncing ? 'Syncing...' : 'Sync Events'}
                    </button>
                    {NAV_ITEMS.map(({ section, label }) => (
                        <button
                            key={section}
                            className={`p-3 rounded-lg shadow-md transition-colors ${activeSection === section ? 'bg-gold text-black' : 'bg-black text-gold hover:bg-gold hover:text-black'}`}
                            onClick={() => handleSectionChange(section)}
                        >
                            {label}
                        </button>
                    ))}
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
                    {activeSection === 'confirmation-email' && <ConfirmationEmailSection />}
                </main>
            </div>
        </div>
    );
};
