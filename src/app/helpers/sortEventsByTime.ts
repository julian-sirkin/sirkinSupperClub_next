import { ParsedEvent } from "../networkCalls/contentful/contentfulServices.types";



export const sortEventsByTime = (parsedEvents: ParsedEvent[]) => {
    const upcomingEvents: ParsedEvent[] = []
    const pastEvents: ParsedEvent[] = []
    
    if (parsedEvents.length === 0) {
        return {upcomingEvents, pastEvents}
    }

    parsedEvents.forEach((event) => {
        if (event?.date && event?.date < new Date()) {
          pastEvents.push(event);
        } else {
          upcomingEvents.push(event);
        }
      });
  
      upcomingEvents.sort((a, b) => {
        if (a?.date && b?.date) {
          return b?.date?.valueOf() - a?.date?.valueOf(); // Descending: most future first
        } else {
          return b.price - a.price;
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