import { ContentfulEventResponse, ParsedEvents, Parsedticket, UnparsedTickets } from "../contentfulServices.types"

export const parseEvents = (eventData: ContentfulEventResponse): ParsedEvents[] => {
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

const parseTickets = (tickets: UnparsedTickets): Parsedticket[]  => {
    return tickets.items.map((ticket) => ( {
        ...ticket,
        time: new Date(ticket.ticketsAvailble),
    }))
}