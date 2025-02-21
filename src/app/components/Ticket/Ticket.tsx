"use client";
import {
  ParsedEvent,
  ParsedTicket,
} from "@/app/networkCalls/contentful/contentfulServices.types";
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
      eventContentfulId: event.contentfulEventId,
    });
  };

  return (
    <form className="border-2 md:border-4 w-auto md:w-3/4 border-white p-2 md:p-4 bg-black opacity-95 mb-4 md:mb-6 max-w-[346px] md:max-w-[450px]">
      <h4 className="text-gold text-xl font-bold md:text-2xl mb-4 overflow-hidden h-16 line-clamp-2">
        {ticket.title}
      </h4>
      <div className="flex justify-between gap-6 md:gap-8">
        <section>
          <h5 className="text-white">
            Dining Time:{" "}
            {ticket.time.toLocaleString("en-us", {
              hour: "numeric",
              minute: "numeric",
            })}
          </h5>
          <h5 className="text-white">Price: ${ticket.price}.00</h5>
        </section>
        {ticketsArray.length > 1 ? (
          <TicketSelect
            availableTickets={ticketsArray}
            handleChangeQuantity={handleChangeQuantity}
            ticketTitle={ticket.title}
          />
        ) : (
          <p className="text-red-600 text-center text-large font-bold w-[180px] pt-4">
            Sold Out
          </p>
        )}
      </div>
    </form>
  );
};
