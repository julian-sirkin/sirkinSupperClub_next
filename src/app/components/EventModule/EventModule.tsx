import { ParsedEvent } from "@/app/contentful/contentfulServices.types";
import { Ticket } from "../Ticket/Ticket";

export const EventModule = (event: ParsedEvent) => {
  return (
    <div className="h-auto bg-black">
      <h1 className="text-3xl font-bold text-gold">{event.title}</h1>
      <p>When: </p>
      <p>
        {event.tickets.map((ticket) => (
          <Ticket key={ticket.title} ticket={ticket} />
        ))}
      </p>
    </div>
  );
};
