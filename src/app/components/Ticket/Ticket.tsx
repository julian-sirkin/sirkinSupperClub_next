"use client";
import {
  ParsedEvent,
  ParsedTicket,
} from "@/app/contentful/contentfulServices.types";
import { TicketSelect } from "./TicketSelect";
import { useCartStore } from "@/store/cartStore";

export const Ticket = ({
  ticket,
  event,
}: {
  ticket: ParsedTicket;
  event: ParsedEvent;
}) => {
  const updateCart = useCartStore((state) => state.updateCart);
  const ticketsArray = new Array(ticket.ticketsAvailable + 1)
    .fill(1)
    .map((__, index) => index);

  const handleChangeQuantity = (numberOfTickets: number) => {
    updateCart({
      ...ticket,
      quantity: numberOfTickets,
      eventContentfulId: event.contentfulId,
    });
  };

  return (
    <form className="border-2 md:border-4 md:w-3/4 mx-auto border-white p-2 md:p-4 bg-black opacity-95 mb-4 md:mb-6">
      <h4 className="text-gold text-xl font-bold md:text-2xl mb-4">
        {ticket.title}
      </h4>
      <div className="flex justify-between">
        <section>
          <h5 className="text-white">Dining Time: </h5>
          <h5 className="text-white">Price: ${ticket.price}.00</h5>
        </section>
        <TicketSelect
          availableTickets={ticketsArray}
          handleChangeQuantity={handleChangeQuantity}
          ticketTitle={ticket.title}
        />
      </div>
    </form>
  );
};
