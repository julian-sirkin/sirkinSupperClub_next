import { eventsFixture } from "../../../__test__/helpers/sortEventsByTime/sortEventsByTime.fixture";
import { EventTeaserCard } from "../components/EventTeaserCard/EventTeaserCard";
import { MainLayout } from "../components/mainLayout/MainLayout";
import { contentfulService } from "../networkCalls/contentful/contentfulService";
import { ParsedEvent } from "../networkCalls/contentful/contentfulServices.types";
import { sortEventsByTime } from "../helpers/sortEventsByTime";
import { getAllAdminEvents } from "../api/queries/select";

export default async function Events() {
  const contentful = contentfulService();
  const eventData = await contentful.getEvents();
  const { upcomingEvents, pastEvents } = sortEventsByTime(eventData);

  return (
    <MainLayout>
      <section
        id="featured Event"
        className="h-auto p-4 md:p-12 bg-communal_table bg-cover"
      >
        {upcomingEvents.length > 0 ? (
          <EventTeaserCard event={upcomingEvents[0]} isFeaturedEvent={true} />
        ) : null}
      </section>
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
      <section id="Past Events" className="bg-black p-6 md:p-12">
        <h3 className="mt-8 md:mt-12 mb-4 md:mb-6 text-2xl md:text-4xl text-center md:text-left text-white">
          Past Events
        </h3>
        <div className="flex justify-center md:justify-center flex-wrap space-between gap-5">
          {pastEvents.map((event) => (
            <EventTeaserCard
              key="event.title"
              event={event}
              isFeaturedEvent={false}
            />
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
