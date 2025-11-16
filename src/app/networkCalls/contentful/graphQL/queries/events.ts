export const eventsQuery = `query fetch{
    eventTypeCollection(limit:100, order: date_DESC){
    items{
        _id
        title
        date
        shortDescription
        longDescription{
            json
        }
        price
        menu{
            json
        }
        ticketsCollection(limit:10){
            items{
                _id
                title
                ticketTime
                ticketsAvailable
                price
                isAddonTicket
                }
            }
        }
    }
}`