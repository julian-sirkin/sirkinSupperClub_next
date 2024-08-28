"use client";
import { ParsedTicket } from "@/app/contentful/contentfulServices.types";
import { useCartStore } from "@/store/cartStore";
import { TicketSelect } from "./TicketSelect";

export const Ticket = ({
  ticket,
  price,
}: {
  ticket: ParsedTicket;
  price: number;
}) => {
  const updateCart = useCartStore((state) => state.updateCart);
  const ticketsArray = new Array(ticket.ticketsAvailable + 1)
    .fill(1)
    .map((__, index) => index);

  const handleChangeQuantity = (numberOfTickets: number) => {
    updateCart({ id: ticket.title, quantity: numberOfTickets, price });
  };

  return (
    <form className="border-2 md:border-4 md:w-3/4 mx-auto border-white p-2 md:p-4 bg-black opacity-95">
      <h4 className="text-gold text-xl font-bold md:text-2xl mb-4">
        {ticket.title}
      </h4>
      <div className="flex justify-between">
        <section>
          <h5 className="text-white">Dining Time: </h5>
          <h5 className="text-white">Price: ${price}.00</h5>
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
