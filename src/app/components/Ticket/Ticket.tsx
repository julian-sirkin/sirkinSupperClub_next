"use client";
import { ParsedTicket } from "@/app/contentful/contentfulServices.types";
import { ChangeEvent, useState } from "react";

export const Ticket = ({ ticket }: { ticket: ParsedTicket }) => {
  const [numberOfTicketsSelected, setNumberOfTicketsSelected] = useState(0);
  const ticketsArray = new Array(ticket.ticketsAvailable + 1)
    .fill(1)
    .map((__, index) => index);

  const handleTicketChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setNumberOfTicketsSelected(Number(e.target.value));
  };

  return (
    <form>
      <h3 className="text-gold">{ticket.title}</h3>
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
