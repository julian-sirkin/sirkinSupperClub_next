import { ParsedEvent, PhotoGalleryResponse } from "./contentfulServices.types"
import { eventsQuery } from "./graphQL/queries/events"
import { photoAlbumQuery } from "./graphQL/queries/photoAlbum"
import { parseEvents } from "./parsers/parseEvents"
import { parsePhotoGallery } from "./parsers/parsePhotoGallery"
import { getTicketsByIdAndEvent } from "@/app/api/queries/select"

export const contentfulService = () => {
    const contentfulEndpoint = process.env.CONTENTFUL_GRAPHQL_ENDPOINT

    const getPhotoGallery = async () => {
        const requestBody = JSON.stringify({query: photoAlbumQuery})

        if (contentfulEndpoint) {
            const fetchOptions = {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.CONTENTFUL_DELIVERY_TOKEN}`
                },
                body: requestBody
            }

            const response = await fetch(contentfulEndpoint, fetchOptions)
            const decodedResponse: {data: PhotoGalleryResponse} = await response.json()
            return await parsePhotoGallery(decodedResponse.data)
        } else {
            return []
        }
    }

    const getEvents = async (): Promise<ParsedEvent[]> => {
        const requestBody = JSON.stringify({query: eventsQuery})

        if (contentfulEndpoint) {
            const fetchOptions = {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.CONTENTFUL_DELIVERY_TOKEN}`
                },
                body: requestBody,
                cache: 'no-store'
            }

            const response = await fetch(contentfulEndpoint, fetchOptions)
            const decodedResponse: {data: any} = await response.json()
            if (decodedResponse?.data?.eventTypeCollection) {
                const parsedEvents = parseEvents(decodedResponse.data.eventTypeCollection)
                return await updateTicketsAvailability(parsedEvents)
            } else {
                return parseEvents(null)
            }
        } else {
            return []
        }
    }

    const getEventsWithoutDB = async (): Promise<ParsedEvent[]> => {
        const requestBody = JSON.stringify({query: eventsQuery})

        if (contentfulEndpoint) {
            const fetchOptions = {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.CONTENTFUL_DELIVERY_TOKEN}`
                },
                body: requestBody,
                cache: 'no-store'
            }

            const response = await fetch(contentfulEndpoint, fetchOptions)
            const decodedResponse: {data: any} = await response.json()
            if (decodedResponse?.data?.eventTypeCollection) {
                return parseEvents(decodedResponse.data.eventTypeCollection)
            } else {
                return parseEvents(null)
            }
        } else {
            return []
        }
    }

    const updateTicketsAvailability = async (parsedEvents: ParsedEvent[]): Promise<ParsedEvent[]> => {
        try {
            // If there's no database connection, just return the events
            if (!process.env.TURSO_CONNECTION_URL || !process.env.TURSO_AUTH_TOKEN) {
                console.warn('Database connection credentials missing, skipping ticket availability update');
                return parsedEvents;
            }

            const allTickets = parsedEvents.flatMap(event => 
                event.tickets.map(ticket => ({ 
                    ...ticket, 
                    contentfulEventId: event.contentfulEventId
                }))
            )

            const reshapedTickets = allTickets.map(ticket => ({
                contentfulTicketId: ticket.contentfulTicketId,
                eventContentfulId: ticket.contentfulEventId
            }))
            
            console.log('Fetching tickets from database...')
            const dbTickets = await getTicketsByIdAndEvent(reshapedTickets as { contentfulTicketId: string; eventContentfulId: string }[])
            
            return parsedEvents.map(event => ({
                ...event,
                tickets: event.tickets.map(ticket => {
                    const dbTicket = dbTickets.find(dbTicket => dbTicket.ticket.contentfulId === ticket.contentfulTicketId)
                    return dbTicket ? {
                        ...ticket,
                        ticketsAvailable: dbTicket.ticket.totalAvailable - dbTicket.ticket.totalSold
                    } : ticket
                })
            }))
        } catch (error) {
            console.error('Error updating ticket availability:', error)
            // Return the original events without DB integration as a fallback
            return parsedEvents
        }
    }

    return { getPhotoGallery, getEvents, getEventsWithoutDB }
}