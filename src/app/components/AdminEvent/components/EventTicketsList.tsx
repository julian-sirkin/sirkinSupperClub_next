'use client';

import { TicketWithPurchases } from '@/app/api/api.types';
import { AdminTicketInfo } from '../../AdminTicketInfo/AdminTicketInfo';

interface EventTicketsListProps {
  tickets: TicketWithPurchases[];
  onRefund: (message: string) => void;
  onCustomerClick?: (customerId: number) => void;
}

export function EventTicketsList({
  tickets,
  onRefund,
  onCustomerClick
}: EventTicketsListProps) {
  if (tickets.length === 0) {
    return (
      <div className="text-center p-8 text-white bg-black/50 rounded-lg">
        No tickets found for this event.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tickets.map(ticket => (
        <AdminTicketInfo 
          key={ticket.ticketId} 
          ticket={ticket} 
          setRefundToast={onRefund}
          onCustomerClick={onCustomerClick}
        />
      ))}
    </div>
  );
} 