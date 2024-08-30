import { ContentfulEventResponse, ParsedEvent, ParsedTicket, UnparsedTickets } from "../contentfulServices.types"

export const parseEvents = (eventData: ContentfulEventResponse | null): ParsedEvent[] => {
    if (eventData === null) {
        return []
    }
    
    return eventData.items.map( event => (
        {
            title: event.title,
            date: new Date(event.date),
            price: event.price,
            menu: event.menu.json,
            shortDescription: event.shortDescription,
            tickets: parseTickets(event.ticketsCollection),
            longDescription: event.longDescription.json
        }
    ))
}

const parseTickets = (tickets: UnparsedTickets): ParsedTicket[]  => {
    return tickets.items.map((ticket) => ( {
        ...ticket,
        ticketsAvailable: Number(ticket.ticketsAvailable),
        time: new Date(ticket.ticketTime),
    }))
}