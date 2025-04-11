import { EventWithTickets, RefundToastFunction } from '@/types';
import { AdminTicketInfo } from '../AdminTicketInfo/AdminTicketInfo';
import { formatDate } from '@/app/utils/formatDate';

type AdminEventDetailsProps = {
  event: EventWithTickets;
  setRefundToast: RefundToastFunction;
};

export const AdminEventDetails = ({ event, setRefundToast }: AdminEventDetailsProps) => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{event.title}</h1>
      <p className="text-xl">{formatDate(new Date(event.date))}</p>
      
      <div className="space-y-6">
        {event.tickets.map((ticket, index) => (
          <AdminTicketInfo 
            key={ticket.ticketId} 
            ticket={ticket} 
            setRefundToast={setRefundToast}
            ticketName={`Ticket ${index + 1}`} // You can replace this with actual ticket name if available
          />
        ))}
      </div>
    </div>
  );
}; 