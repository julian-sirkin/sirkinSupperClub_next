import { ContentfulEventResponse, ParsedEvent, ParsedTicket, UnparsedTickets } from "../contentfulServices.types"

export const parseEvents = (eventData: ContentfulEventResponse | null): ParsedEvent[] => {
    if (eventData === null) {
        return []
    }
   
    return eventData.items.map( event => (
        {
            contentfulEventId: event._id,
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
        contentfulTicketId: ticket?._id ?? null,
        ticketsAvailable: Number(ticket?.ticketsAvailable ?? 0),
        time: new Date(ticket?.ticketTime),
        price: ticket?.price ?? eventPrice,
        isAddonTicket: false,
        addons: (ticket?.addonCollection?.items ?? [])
            .filter(addon => addon?._id && addon?.title)
            .map(addon => ({
                contentfulAddonId: addon._id,
                title: addon.title ?? '',
                price: Number(addon.price ?? 0),
            })),
    }))
}