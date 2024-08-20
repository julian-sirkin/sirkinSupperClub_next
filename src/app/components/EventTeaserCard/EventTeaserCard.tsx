import { ParsedEvent } from "@/app/contentful/contentfulServices.types";
import Link from "next/link";

export const EventTeaserCard = ({ event }: { event: ParsedEvent }) => {
  return (
    <div className="h-80 w-80 bg-black opacity-90 p-4 text-white">
      <h2 className="text-white font-bold text-center text-3xl">
        {event.title}
      </h2>
      <p className=": text-center pt-8">{event.shortDescription}</p>
      <p>Date: {event.date.getDate()}</p>
      <Link href={`/events/${event.title}`}>See Full Details</Link>
    </div>
  );
};
