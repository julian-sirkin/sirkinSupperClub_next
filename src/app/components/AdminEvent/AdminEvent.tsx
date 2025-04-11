'use client'
import { TicketWithPurchases } from '@/app/api/api.types'
import { useState, useEffect } from 'react'
import { AdminTicketInfo } from '../AdminTicketInfo/AdminTicketInfo'
import { toast } from 'react-toastify'
import { formatDate } from '@/app/utils/formatDate'
import { getAdminEvent } from '@/app/lib/apiClient'

export const AdminEvent = ({eventId, resetEvent}: {eventId: number, resetEvent: (event: number | null) => void}) => {
    const [eventData, setEventData] = useState<TicketWithPurchases[]>([])
    const [eventTitle, setEventTitle] = useState<string>("Event Details")
    const [eventDate, setEventDate] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const fetchEventData = async () => {
        setIsLoading(true)
        setError(null)
        
        try {
            const fetchedEventData = await getAdminEvent(eventId);
            
            const decodedEventData = await fetchedEventData.json()
            
            if (fetchedEventData.ok && decodedEventData.data) {
                setEventData(decodedEventData.data.tickets || [])
                setEventTitle(decodedEventData.data.title || "Event Details")
                setEventDate(decodedEventData.data.date || null)
            } else {
                const errorMsg = decodedEventData.message || "Failed to load event data";
                setError(errorMsg)
                toast.error(errorMsg)
            }
        } catch (error) {
            console.error("Error fetching event data:", error)
            setError("Error connecting to server")
            toast.error("Error connecting to server")
        } finally {
            setIsLoading(false)
        }
    }    

    useEffect(() => { 
        fetchEventData()
    }, [eventId])
    
    const handleRefund = (message: string) => {
        toast(message, { 
            type: message.includes("Success") ? "success" : "error",
            autoClose: 3000
        })
        
        setTimeout(() => {
            fetchEventData();
        }, 1000)
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
    }
    
    if (error) {
        return (
            <div className="bg-black/30 rounded-lg p-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gold">Error Loading Event</h2>
                    <button 
                        onClick={() => resetEvent(null)} 
                        className="bg-black text-gold px-4 py-2 rounded hover:bg-gold hover:text-black transition-colors"
                    >
                        Back to Events
                    </button>
                </div>
                <div className="text-center p-8 text-white bg-black/50 rounded-lg">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-gold text-black px-4 py-2 rounded hover:bg-white transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }
    
    return (
        <div className="bg-black/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gold">{eventTitle}</h2>
                    {eventDate && (
                        <p className="text-gray-400 mt-1">
                            {formatDate(new Date(eventDate))}
                        </p>
                    )}
                </div>
                <button 
                    onClick={() => resetEvent(null)} 
                    className="bg-black text-gold px-4 py-2 rounded hover:bg-gold hover:text-black transition-colors"
                >
                    Back to Events
                </button>
            </div>
            
            {eventData.length > 0 ? (
                <div className="space-y-6">
                    {eventData.map(ticket => (
                        <AdminTicketInfo 
                            key={ticket.ticketId} 
                            ticket={ticket} 
                            setRefundToast={handleRefund}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 text-white bg-black/50 rounded-lg">
                    No tickets found for this event.
                </div>
            )}
        </div>
    )
}