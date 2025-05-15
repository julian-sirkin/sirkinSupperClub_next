'use client'
import { TicketWithPurchases } from '@/app/api/api.types'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { AdminEventUI } from './AdminEventUI'
import { fetchEventData, sendEventEmail } from './services/eventService'

export const AdminEvent = ({eventId, resetEvent}: {eventId: number, resetEvent: (event: number | null) => void}) => {
    const [eventData, setEventData] = useState<TicketWithPurchases[]>([])
    const [eventTitle, setEventTitle] = useState<string>("Event Details")
    const [eventDate, setEventDate] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [showEmailComposer, setShowEmailComposer] = useState(false)
    const [recipientEmails, setRecipientEmails] = useState<string[]>([])

    const loadEventData = async () => {
        setIsLoading(true)
        setError(null)
        
        try {
            const data = await fetchEventData(eventId);
            setEventData(data.tickets)
            setEventTitle(data.title)
            setEventDate(data.date)
            setRecipientEmails(data.recipientEmails)
        } catch (error) {
            console.error("Error fetching event data:", error)
            const errorMessage = error instanceof Error ? error.message : "Error connecting to server"
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }    

    useEffect(() => { 
        loadEventData()
    }, [eventId])
    
    const handleRefund = (message: string) => {
        toast(message, { 
            type: message.includes("Success") ? "success" : "error",
            autoClose: 3000
        })
        
        setTimeout(() => {
            loadEventData();
        }, 1000)
    }

    const handleSendEmail = async (subject: string, content: string) => {
        try {
            await sendEventEmail(recipientEmails, subject, content);
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    };

    return (
        <AdminEventUI
            eventData={eventData}
            eventTitle={eventTitle}
            eventDate={eventDate}
            isLoading={isLoading}
            error={error}
            showEmailComposer={showEmailComposer}
            recipientEmails={recipientEmails}
            onToggleEmailComposer={() => setShowEmailComposer(!showEmailComposer)}
            onResetEvent={resetEvent}
            onRefund={handleRefund}
            onSendEmail={handleSendEmail}
            onRetry={() => window.location.reload()}
        />
    );
}