'use client'
import { TicketWithPurchases } from '@/app/api/api.types'
import { getCachedEvent } from '@/app/admin/adminDataCache'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { AdminEventUI } from './AdminEventUI'
import { EventData, fetchEventData, sendEventEmail } from './services/eventService'

function applyCachedEvent(cached: EventData | undefined) {
    return {
        tickets: cached?.tickets ?? [],
        title: cached?.title ?? 'Event Details',
        date: cached?.date ?? null,
        recipientEmails: cached?.recipientEmails ?? [],
    }
}

export const AdminEvent = ({
    eventId, 
}: {
    eventId: number, 
}) => {
    const initial = applyCachedEvent(getCachedEvent(eventId))
    const [eventData, setEventData] = useState<TicketWithPurchases[]>(initial.tickets)
    const [eventTitle, setEventTitle] = useState<string>(initial.title)
    const [eventDate, setEventDate] = useState<number | null>(initial.date)
    const [isLoading, setIsLoading] = useState<boolean>(() => !getCachedEvent(eventId))
    const [error, setError] = useState<string | null>(null)
    const [showEmailComposer, setShowEmailComposer] = useState(false)
    const [showMarketingComposer, setShowMarketingComposer] = useState(false)
    const [recipientEmails, setRecipientEmails] = useState<string[]>(initial.recipientEmails)

    const loadEventData = useCallback(async (force = false) => {
        if (force || !getCachedEvent(eventId)) {
            setIsLoading(true)
        }
        setError(null)
        
        try {
            const data = await fetchEventData(eventId, { force });
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
    }, [eventId])    

    useEffect(() => { 
        loadEventData()
    }, [loadEventData])
    
    const handleRefund = (message: string) => {
        toast(message, { 
            type: message.includes("Success") ? "success" : "error",
            autoClose: 3000
        })
        
        setTimeout(() => {
            loadEventData(true);
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
            eventId={eventId}
            eventData={eventData}
            eventTitle={eventTitle}
            eventDate={eventDate}
            isLoading={isLoading}
            error={error}
            showEmailComposer={showEmailComposer}
            showMarketingComposer={showMarketingComposer}
            recipientEmails={recipientEmails}
            onToggleEmailComposer={() => setShowEmailComposer(!showEmailComposer)}
            onToggleMarketingComposer={() => setShowMarketingComposer(!showMarketingComposer)}
            onRefund={handleRefund}
            onSendEmail={handleSendEmail}
            onRetry={() => window.location.reload()}
        />
    );
}