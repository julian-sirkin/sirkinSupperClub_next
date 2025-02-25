import { EventTeaserCard } from "../components/EventTeaserCard/EventTeaserCard";
import { MainLayout } from "../components/mainLayout/MainLayout";
import { contentfulService } from "../networkCalls/contentful/contentfulService";
import { ParsedEvent } from "../networkCalls/contentful/contentfulServices.types";
import { sortEventsByTime } from "../helpers/sortEventsByTime";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Events() {
  const contentful = contentfulService();
  let eventData: ParsedEvent[] = [];
  let dbError = false;
  
  try {
    eventData = await contentful.getEvents();
  } catch (error) {
    console.error('Error fetching events with DB integration:', error);
    dbError = true;
    
    // Fallback: Get events without DB integration
    try {
      eventData = await contentful.getEventsWithoutDB();
      console.log('Successfully fetched events without DB integration');
    } catch (fallbackError) {
      console.error('Critical error: Failed to fetch events even without DB:', fallbackError);
      eventData = []; // Empty array as last resort
    }
  }
  
  const { upcomingEvents, pastEvents } = sortEventsByTime(eventData);

  return (
    <MainLayout>
      {dbError && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">Note</p>
          <p>Ticket availability information may not be accurate. Please contact us to confirm availability.</p>
        </div>
      )}
      
      <section
        id="featured Event"
        className="h-auto p-4 md:p-12 bg-communal_table bg-cover"
      >
        {upcomingEvents.length > 0 ? (
          <EventTeaserCard event={upcomingEvents[0]} isFeaturedEvent={true} />
        ) : (
          <div className="text-center p-12 bg-black/70 text-white rounded-lg">
            <h2 className="text-3xl font-bold mb-4">No Upcoming Events</h2>
            <p className="text-xl">Check back soon for new events!</p>
          </div>
        )}
      </section>
      
      {upcomingEvents.length > 1 && (
        <section id="other events" className="bg-black p-6 md:p-12">
          <h2 className="mt-8 md:mt-12 mb-4 md:mb-6 text-2xl md:text-4xl text-center md:text-left text-white">
            Other Upcoming Events
          </h2>

          <div className="flex justify-center md:justify-start flex-wrap">
            {upcomingEvents.slice(1).map((event) => (
              <EventTeaserCard
                key={event.title}
                event={event}
                isFeaturedEvent={false}
              />
            ))}
          </div>
        </section>
      )}
      
      {pastEvents.length > 0 && (
        <section id="Past Events" className="bg-black p-6 md:p-12">
          <h3 className="mt-8 md:mt-12 mb-4 md:mb-6 text-2xl md:text-4xl text-center md:text-left text-white">
            Past Events
          </h3>
          <div className="flex justify-center md:justify-center flex-wrap space-between gap-5">
            {pastEvents.map((event) => (
              <EventTeaserCard
                key={event.title}
                event={event}
                isFeaturedEvent={false}
              />
            ))}
          </div>
        </section>
      )}
    </MainLayout>
  );
}
