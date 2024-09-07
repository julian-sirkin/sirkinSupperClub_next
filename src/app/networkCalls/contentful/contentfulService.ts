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
                next: {revalidate: 300}
            }

            const response = await fetch(contentfulEndpoint, fetchOptions)
            const decodedResponse: {data: any} = await response.json()
            console.log(decodedResponse, 'decoded response')
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

    const updateTicketsAvailability = async (parsedEvents: ParsedEvent[]): Promise<ParsedEvent[]> => {
        const allTickets = parsedEvents.flatMap(event => 
            event.tickets.map(ticket => ({ 
                ...ticket, 
                contentfulEventId: event.contentfulEventId // Ensure this assignment
            }))
        )

        const reshapedTickets = allTickets.map(ticket => ({
            contentfulTicketId: ticket.contentfulTicketId,
            eventContentfulId: ticket.contentfulEventId
        }))

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
    }

    return { getPhotoGallery, getEvents }
}