import { ParsedEvent } from "@/app/networkCalls/contentful/contentfulServices.types";
import Link from "next/link";

export const EventTeaserCard = ({
  event,
  isFeaturedEvent,
}: {
  event: ParsedEvent;
  isFeaturedEvent: boolean;
}) => {
  const eventDate = event.date.toLocaleString("en-us", {
    month: "short",
    day: "numeric",
  });
  const numberOfSeatsAvailable = event.tickets.reduce(
    (availableSeats, currentTicket) => {
      return !currentTicket.isAddonTicket
        ? availableSeats + currentTicket.ticketsAvailable
        : availableSeats;
    },
    0
  );

  return (
    <div
      className={`w-11/12 h-auto relative ${
        isFeaturedEvent
          ? "md:w-[550px] mx-auto px-8 md:px-12 py-12 border-8"
          : "md:w-[420px] py-6 border-4 px-4"
      } bg-black opacity-95 px-4 text-white border-gold min-h-[620px]`}
    >
      <div className={`${
        isFeaturedEvent ? "h-32" : "h-24"
      }`}>
        <h2
          className={`${
            isFeaturedEvent ? "text-4xl" : "text-3xl"
          } font-bold text-center text-gold line-clamp-2`}
        >
          {event.title}
        </h2>
      </div>
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
          isFeaturedEvent ? "gap-x-6" : "gap-x-2"
        } grid grid-cols-[auto_1fr] max-w-md absolute bottom-28 left-0 right-0 px-8`}
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
            {event.price > 0 ? `$${event.price}.00` : "Free"}
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
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <Link href={`/events/${event.title}`}>
          <button className="p-6 bg-gold text-black text-xl font-bold">
            See Full Details
          </button>
        </Link>
      </div>
    </div>
  );
};
