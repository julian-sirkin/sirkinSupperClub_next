import { ParsedEvent } from "@/app/contentful/contentfulServices.types";
import { Ticket } from "../Ticket/Ticket";
import { Menu } from "../Menu/Menu";
import { EventLongDescription } from "../EventLongDescription/EventLongDescription";
import PhotosModule from "../Modules/PhotosModule/PhotosModule";

export const EventModule = ({ event }: { event: ParsedEvent }) => {
  return (
    <div className="h-auto px-4 py-16 bg-black">
      <h1 className="text-3xl md:text-6xl text-center font-bold text-white">
        {event.title}
      </h1>
      <Menu menu={event.menu} price={event.price} />
      <EventLongDescription description={event.longDescription} />
      <div className="border-b-8 border-b-white" />
      <section
        id="tickets"
        aria-label="Ticket Section"
        className=" w-auto md:w-1/2 border-2 md:border-4 border-gold mx-auto p-2 md:p-6 bg-gold mt-8 md:mt-12 mb-12"
      >
        <h3 className="text-white text-bold font-bold text-2xl md:text-5xl text-center mb-4 md:mb-4">
          Tickets
        </h3>
        {event.tickets.map((ticket) => (
          <Ticket
            key={ticket.title}
            ticket={ticket}
            price={event.price}
            contentfulEventId={event.contentfulId}
          />
        ))}
      </section>
      <PhotosModule />
    </div>
  );
};
