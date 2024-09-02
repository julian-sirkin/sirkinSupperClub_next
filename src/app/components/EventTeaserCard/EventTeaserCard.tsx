import { ParsedEvent } from "@/app/contentful/contentfulServices.types";
import Link from "next/link";

export const EventTeaserCard = ({
  event,
  isFeaturedEvent,
}: {
  event: ParsedEvent;
  isFeaturedEvent: boolean;
}) => {
  const eventDate = `${event.date.toLocaleDateString("default", {
    month: "long",
  })} ${event.date.getMonth()}, ${event.date.getFullYear()}`;
  const numberOfSeatsAvailable = event.tickets.reduce(
    (availableSeats, currentTicket) =>
      availableSeats + currentTicket.ticketsAvailable,
    0
  );

  return (
    <div
      className={`w-11/12 h-auto ${
        isFeaturedEvent
          ? "md:w-[500px] mx-auto md:px-8 py-12"
          : "md:w-[360px] py-6"
      } bg-black opacity-90 px-4 text-white`}
    >
      <h2
        className={`${
          isFeaturedEvent ? "text-4xl mb-8 md:mb-12" : "text-3xl mb-4 md:mb-6"
        } font-bold text-center text-gold`}
      >
        {event.title}
      </h2>
      <p
        className={`${
          isFeaturedEvent
            ? "text-2xl md:text-3xl mb-10 md:mb-16"
            : "text-xl md:text-2xl mb-5 md:mb-8"
        } text-center pt-4`}
      >
        {event.shortDescription}
      </p>
      <div
        className={`${
          isFeaturedEvent ? "gap-x-6 mb-10 md:mb-16" : "gap-x-2 mb-5 md:mb-8"
        } grid grid-cols-[auto_1fr] max-w-md`}
      >
        <div className="contents">
          <span className="text-gold text-lg md:text-xl font-bold whitespace-nowrap">
            When:
          </span>
          <p
            className={`${
              isFeaturedEvent ? "md:text-2xl md:mb-8" : ""
            } text-xl  mb-4  -indent-[1ch] pl-[1ch]`}
          >
            {eventDate}
          </p>
        </div>
        <div className="contents">
          <span className="text-gold text-lg md:text-xl font-bold whitespace-nowrap">
            Price:
          </span>
          <p
            className={`${
              isFeaturedEvent ? "md:text-2xl md:mb-8" : ""
            } text-xl  mb-4  -indent-[1ch] pl-[1ch]`}
          >
            ${event.price}.00
          </p>
        </div>
        <div className="contents">
          <span className="text-gold text-lg md:text-xl font-bold whitespace-nowrap">
            Available seats:
          </span>
          <p
            className={`${
              isFeaturedEvent ? "md:text-2xl" : ""
            } text-xl  -indent-[1ch] pl-[1ch]`}
          >
            {numberOfSeatsAvailable}
          </p>
        </div>
      </div>
      <div className="flex justify-center">
        <Link href={`/events/${event.title}`}>
          <button className="p-6 bg-gold text-black text-xl font-bold">
            See Full Details
          </button>
        </Link>
      </div>
    </div>
  );
};
