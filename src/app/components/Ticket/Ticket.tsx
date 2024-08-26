"use client";
import { ParsedTicket } from "@/app/contentful/contentfulServices.types";
import { ChangeEvent, useState } from "react";
import { TicketSelect } from "./TicketSelect";

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

  const handleChangeQuantity = (numberOfTickets: string) => {
    console.log(numberOfTickets);
    console.log("numberOfTickets");
  };

  return (
    <form className="border-2 md:border-4 border-white p-2 md:p-4 bg-black opacity-95">
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
