import { ParsedEvent } from "@/app/networkCalls/contentful/contentfulServices.types";
import { Ticket } from "../Ticket/Ticket";
import { Menu } from "../Menu/Menu";
import { EventLongDescription } from "../EventLongDescription/EventLongDescription";
import PhotosModule from "../Modules/PhotosModule/PhotosModule";
import { CheckoutDialog } from "../CheckoutDialog/CheckoutDialog";
import { CartTotalDisplay } from "./CartTotalDisplay";

export const EventModule = ({ event }: { event: ParsedEvent }) => {
  return (
    <div className="h-auto py-16 bg-black">
      <h1 className="text-3xl md:text-6xl pb-4 md:pb-6 text-center font-bold text-gold">
        {event.title}
      </h1>
      <div className="h-auto bg-communal_table bg-cover py-4 md:py-16">
        <Menu menu={event.menu} price={event.price} />
      </div>

      <EventLongDescription description={event.longDescription} />
      <div className="border-b-8 border-b-white" />
      <section
        id="tickets"
        aria-label="Ticket Section"
        className=" w-auto md:w-1/2 border-2 md:border-4 border-gold mx-auto md:px-6 py-6 md:py-10 bg-gold mt-8 md:mt-12 mb-12"
      >
        <h3 className="text-white text-bold font-bold text-2xl md:text-5xl text-center mb-4 md:mb-4">
          Tickets
        </h3>
        <div id="Tickets container" className="mb-6 flex flex-col items-center">
          {event.tickets.map((ticket) => (
            <Ticket key={ticket.title} ticket={ticket} event={event} />
          ))}
          <CartTotalDisplay />
        </div>

        <CheckoutDialog event={event} />
      </section>
      <PhotosModule />
    </div>
  );
};
