import { ParsedEvent, PhotoGalleryResponse } from "./contentfulServices.types"
import { eventsQuery } from "./graphQL/queries/events"
import { photoAlbumQuery } from "./graphQL/queries/photoAlbum"
import { parseEvents } from "./parsers/parseEvents"
import { parsePhotoGallery } from "./parsers/parsePhotoGallery"
import { getTicketsByIdAndEvent } from "@/app/api/queries/select"

export const contentfulService = () => {
    const contentfulEndpoint = process.env.CONTENTFUL_GRAPHQL_ENDPOINT
    type GraphQLResponse = {
        data?: any
        errors?: { message: string }[]
    }
    
    // Log endpoint info (masked for security)
    if (contentfulEndpoint) {
        const envMatch = contentfulEndpoint.match(/environments\/([^/]+)/);
        const environment = envMatch ? envMatch[1] : 'master';
        const isPreview = contentfulEndpoint.includes('preview') || environment !== 'master';
        const envType = isPreview ? 'PREVIEW/DEV' : 'PRODUCTION';
        
        console.log(`🔵 [Contentful] ${envType}`);
    } else {
        console.warn('[Contentful] ⚠️  No CONTENTFUL_GRAPHQL_ENDPOINT found');
    }

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
            const fetchOptions: RequestInit = {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.CONTENTFUL_DELIVERY_TOKEN}`
                },
                body: requestBody,
                cache: "no-store"
            }

            const response = await fetch(contentfulEndpoint, fetchOptions)
            const decodedResponse: GraphQLResponse = await response.json()
            if (decodedResponse?.errors?.length) {
                console.error("[Contentful] GraphQL errors in getEvents:", decodedResponse.errors);
            }
            if (decodedResponse?.data?.eventTypeCollection) {
                const parsedEvents = parseEvents(decodedResponse.data.eventTypeCollection)
                console.log(`[Contentful] getEvents fetched ${decodedResponse.data.eventTypeCollection.items?.length ?? 0} events`);
                return await updateTicketsAvailability(parsedEvents)
            } else {
                console.warn("[Contentful] getEvents returned no eventTypeCollection data");
                return parseEvents(null)
            }
        } else {
            return []
        }
    }

    const getEventsWithoutDB = async (): Promise<ParsedEvent[]> => {
        const requestBody = JSON.stringify({query: eventsQuery})

        if (contentfulEndpoint) {
            const fetchOptions: RequestInit = {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.CONTENTFUL_DELIVERY_TOKEN}`
                },
                body: requestBody,
                cache: "no-store"
            }

            const response = await fetch(contentfulEndpoint, fetchOptions)
            const decodedResponse: GraphQLResponse = await response.json()
            if (decodedResponse?.errors?.length) {
                console.error("[Contentful] GraphQL errors in getEventsWithoutDB:", decodedResponse.errors);
            }
            if (decodedResponse?.data?.eventTypeCollection) {
                const events = decodedResponse.data.eventTypeCollection
                
                // Log just event count and titles
                console.log(`Fetched ${events.items.length} events from Contentful:`, 
                    events.items.map((e: { title: string }) => e.title).join(', '));
                
                const parsedEvents = parseEvents(events)
                return parsedEvents
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