type event = {
    id: number
    name: string,
    date: string,
    ticketsAvailable: number,
    ticketsSold: number
}

type EventsTableType  = {
    events: event[]
    handleEventClick: (event: number) => void
}

export const EventsTable = ({events, handleEventClick}: EventsTableType) => {
    return (
        <table>
        <tr className="bg-black text-white">
          <th className='py-4 px-2'>Event Name</th>
          <th className='py-4 px-2'>Event Date</th>
          <th className='py-4 px-2'>Total Tickets Available</th>
          <th className='py-4 px-2'>Tickets Sold</th>
        </tr>
        {events.map((event, idx) => (
          <tr className={idx % 2 === 1 ? 'bg-black text-white p-4' : 'bg-gold text-white p-4'}>
            <th className='p-2'><button onClick={() => handleEventClick(event.id)}>{event.name} </button></th>
            <th className='p-2'>{event.date}</th>
            <th className='p-2'>{event.ticketsAvailable}</th>
            <th className='p-2'>{event.ticketsSold}</th>
          </tr>
        ))}
      </table>
    )
}