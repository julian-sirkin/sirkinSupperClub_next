import { EventTeaserCard } from "../components/EventTeaserCard/EventTeaserCard";
import { MainEventTeaserCard } from "../components/EventTeaserCard/MainEventTeaserCard";
import { MainLayout } from "../components/mainLayout/MainLayout";
import { contentfulService } from "../contentful/contentfulService";
import { ParsedEvent } from "../contentful/contentfulServices.types";

export default async function Events() {
  const upcomingEvents: ParsedEvent[] = [];
  const pastEvents: ParsedEvent[] = [];
  const contentful = contentfulService();
  const eventData = await contentful.getEvents();

  eventData.forEach((event) => {
    event.date > new Date()
      ? upcomingEvents.push(event)
      : pastEvents.push(event);
  });

  upcomingEvents.sort((a, b) => a.date.valueOf() - b.date.valueOf());
  return (
    <MainLayout>
      <div className="p-4 md:p-12">
        <h1 className="text-center text-4xl font-bold mb-6 md:mb-12">
          Upcoming Events
        </h1>
        <div>
          <MainEventTeaserCard
            event={upcomingEvents[0]}
            isFeaturedEvent={true}
          />
          <h2 className="mt-8 md:mt-12 mb-4 md:mb-6 text-2xl md:text-4xl">
            Other Upcoming Events
          </h2>
          <section
            className="flex justify-center md:justify-start flex-wrap"
            id="other future events"
          >
            {upcomingEvents.slice(1).map((event) => (
              <MainEventTeaserCard
                key={event.title}
                event={event}
                isFeaturedEvent={false}
              />
            ))}
          </section>
        </div>
        <h3 className="my-4 md:my-6 text-2xl md:text-4xl">Past Events</h3>
        {pastEvents.map((event) => (
          <EventTeaserCard event={event} />
        ))}
      </div>
    </MainLayout>
  );
}
