'use client'
import { syncEvents } from '@/app/utils/syncEvents';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CiMenuBurger } from 'react-icons/ci';
import { IoClose } from 'react-icons/io5';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ADMIN_NAV_ITEMS, isAdminNavActive } from './adminView';

const navButtonClass = (isActive: boolean) =>
    `w-full text-left p-3 rounded-lg shadow-md transition-colors min-h-[44px] ${
        isActive ? 'bg-gold text-black' : 'bg-black text-gold hover:bg-gold hover:text-black'
    }`;

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const handleSyncEvents = async () => {
        if (isSyncing) return;
        setIsSyncing(true);

        try {
            const success = await syncEvents(() => {
                window.location.reload();
            });

            if (success) {
                setTimeout(() => {
                    setIsSyncing(false);
                    window.location.reload();
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

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-6">
            <ToastContainer position="top-right" autoClose={3000} />
            <header className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-bold text-gold mb-1">Admin Panel</h1>
                    <p className="text-sm md:text-base text-gray-400">Manage events, tickets, and customer data</p>
                </div>
                <button
                    type="button"
                    className="md:hidden p-3 rounded-lg border border-gold text-gold min-h-[44px] min-w-[44px]"
                    onClick={() => setIsMenuOpen(open => !open)}
                    aria-expanded={isMenuOpen}
                    aria-controls="admin-nav"
                    aria-label={isMenuOpen ? 'Close admin menu' : 'Open admin menu'}
                >
                    {isMenuOpen ? <IoClose className="text-2xl" /> : <CiMenuBurger className="text-2xl" />}
                </button>
            </header>

            <div className='flex flex-col md:flex-row gap-6'>
                <nav
                    id="admin-nav"
                    className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col gap-3 md:w-64 p-4 bg-black/40 rounded-lg`}
                >
                    <button
                        type="button"
                        className={`bg-black text-gold p-3 rounded-lg hover:bg-gold hover:text-black transition-colors shadow-md min-h-[44px] ${
                            isSyncing ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={handleSyncEvents}
                        disabled={isSyncing}
                    >
                        {isSyncing ? 'Syncing...' : 'Sync Events'}
                    </button>
                    {ADMIN_NAV_ITEMS.map(({ href, label, match }) => (
                        <Link
                            key={href}
                            href={href}
                            className={navButtonClass(isAdminNavActive(pathname, match))}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                <main className='flex-1 min-w-0 bg-black/40 p-4 md:p-6 rounded-lg'>
                    {children}
                </main>
            </div>
        </div>
    );
};
