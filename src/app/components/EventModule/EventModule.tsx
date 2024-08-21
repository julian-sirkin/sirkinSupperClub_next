import { ParsedEvent } from "@/app/contentful/contentfulServices.types";
import { Ticket } from "../Ticket/Ticket";
import { Menu } from "../Menu/Menu";
import { EventLongDescription } from "../EventLongDescription/EventLongDescription";

export const EventModule = ({ event }: { event: ParsedEvent }) => {
  return (
    <div className="h-auto bg-black">
      <h1 className="text-3xl font-bold text-gold">{event.title}</h1>
      <p>When: </p>
      <section aria-label="Ticket Section">
        <Menu menu={event.menu} />
        <EventLongDescription description={event.longDescription} />
        {event.tickets.map((ticket) => (
          <Ticket key={ticket.title} ticket={ticket} />
        ))}
      </section>
    </div>
  );
};
