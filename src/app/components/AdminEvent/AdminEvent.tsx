import { TicketWithPurchases } from '@/app/api/api.types'
import {useState, useEffect} from 'react'
import { AdminTicketInfo } from '../AdminTicketInfo/AdminTicketInfo'

export const AdminEvent = ({eventId, resetEvent}: {eventId: number, resetEvent: (event: number | null ) => void}) => {
    const [eventData, setEventData] = useState<TicketWithPurchases[]>([])
    
    useEffect(() => {
        const fetchEventData = async () => {
            const fetchedEventData = await fetch('/api/getAdminEvent', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({eventId})
            })
            const decodedEventData = await fetchedEventData.json()
            setEventData(decodedEventData.data)
        }     
        fetchEventData()
}, [])
 
    console.log(eventData, 'eventData')

    
    return (<div>
        <h3>Singular Event</h3>
        <button onClick={() => resetEvent(null)}>Back To Events</button>
        {eventData ? (
            <>
            {eventData.map(ticket => (
                <AdminTicketInfo ticket={ticket} key={ticket.ticketId}/>
            ))}
            </>
        ) : (
            <div>Potato</div>
        )}
    </div>)
}