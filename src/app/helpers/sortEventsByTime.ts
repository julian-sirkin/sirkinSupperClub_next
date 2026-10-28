import { ParsedEvent } from "../networkCalls/contentful/contentfulServices.types";

/** An event with no date stays upcoming so it is not hidden or skipped by accident. */
export const isEventInThePast = (date: Date | string | null | undefined) => {
    if (!date) {
        return false;
    }

    return new Date(date).getTime() < Date.now();
};

export const sortEventsByTime = (parsedEvents: ParsedEvent[]) => {
    const upcomingEvents: ParsedEvent[] = []
    const pastEvents: ParsedEvent[] = []
    
    if (parsedEvents.length === 0) {
        return {upcomingEvents, pastEvents}
    }

    parsedEvents.forEach((event) => {
        if (isEventInThePast(event?.date)) {
          pastEvents.push(event);
        } else {
          upcomingEvents.push(event);
        }
      });
  
      upcomingEvents.sort((a, b) => {
        if (a?.date && b?.date) {
          return a?.date?.valueOf() - b?.date?.valueOf(); // Ascending: soonest first
        } else {
          return a.price - b.price;
        }
      });

      pastEvents.sort((a, b) => {
        if (a?.date && b?.date) {
          return b?.date?.valueOf() - a?.date?.valueOf(); // Descending: most recent past first
        } else {
          return b.price - a.price;
        }
      });

      return {upcomingEvents, pastEvents}
}