import { getAllAdminEvents } from "@/app/api/queries/select"

type event = {
    id: number
    name: string,
    date: Date,
    ticketsAvailable: number,
    ticketsSold: number
}

type EventsTableType  = {
    events: event[] | undefined
    handleEventClick: (event: number) => void
}
export const EventsTable = ({events, handleEventClick}: EventsTableType) => {
    return (
        <table>
            <thead>
        <tr className="bg-black text-white">
          <th className='py-4 px-2'>Event Name</th>
          <th className='py-4 px-2'>Event Date</th>
          <th className='py-4 px-2'>Total Tickets Available</th>
          <th className='py-4 px-2'>Tickets Sold</th>
        </tr>
        </thead>
        <tbody>
        {events ? (events.map((event, idx) => (
          <tr className={idx % 2 === 1 ? 'bg-black text-white p-4' : 'bg-gold text-white p-4'} key={event.id}>
            <th className='p-2'><button onClick={() => handleEventClick(event.id)}>{event.name}</button></th>
            <th className='p-2'>{event.date.toLocaleString("en-us", {
    month: "short",
    day: "numeric",
    year: "2-digit"
  })}</th>
            <th className='p-2'>{event.ticketsAvailable}</th>
            <th className='p-2'>{event.ticketsSold}</th>
          </tr>
        ))) : (null)}
        </tbody>
      </table>
    )
}