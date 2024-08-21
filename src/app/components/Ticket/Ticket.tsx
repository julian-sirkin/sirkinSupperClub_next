"use client";
import { ParsedTicket } from "@/app/contentful/contentfulServices.types";
import { ChangeEvent, useState } from "react";

export const Ticket = ({
  ticket,
  price,
}: {
  ticket: ParsedTicket;
  price: number;
}) => {
  const [numberOfTicketsSelected, setNumberOfTicketsSelected] = useState(0);
  const ticketsArray = new Array(ticket.ticketsAvailable + 1)
    .fill(1)
    .map((__, index) => index);

  const handleTicketChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setNumberOfTicketsSelected(Number(e.target.value));
  };

  return (
    <form className="border-2 md:border-4 border-white p-2 md:p-4 bg-black opacity-95">
      <h4 className="text-gold text-xl font-bold md:text-2xl">
        {ticket.title}
      </h4>
      <h5 className="text-white">Dining Time: </h5>
      <h5 className="text-white">Price: ${price}.00</h5>
      <select
        onChange={handleTicketChange}
        className="bg-gold font-bold font-xl w-12 h-8"
        value={numberOfTicketsSelected}
      >
        {ticketsArray.map((ticketValue) => (
          <option
            key={ticketValue}
            value={ticketValue}
            className="bg-gold font-bold font-xl"
          />
        ))}
      </select>
    </form>
  );
};
