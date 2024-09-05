import { ContentfulEventResponse, ParsedEvent, ParsedTicket, UnparsedTickets } from "../contentfulServices.types"

export const parseEvents = (eventData: ContentfulEventResponse | null): ParsedEvent[] => {
    if (eventData === null) {
        return []
    }
    
    return eventData.items.map( event => (
        {
            contentfulId: event._id,
            title: event.title,
            date: new Date(event.date),
            price: event.price,
            menu: event.menu.json,
            shortDescription: event.shortDescription,
            tickets: parseTickets(event.ticketsCollection, event.price),
            longDescription: event.longDescription.json
        }
    ))
}

const parseTickets = (tickets: UnparsedTickets, eventPrice: ParsedEvent['price']): ParsedTicket[]  => {
    return tickets.items.map((ticket) => ( {
        ...ticket,
        contentfulId: ticket._id,
        ticketsAvailable: Number(ticket.ticketsAvailable),
        time: new Date(ticket.ticketTime),
        price: ticket?.price ?? eventPrice,
        isAddonTicket: ticket.isAddonTicket,
    }))
}