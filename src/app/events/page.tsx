import { EventTeaserCard } from "../components/EventTeaserCard/EventTeaserCard";
import { MainLayout } from "../components/mainLayout/MainLayout";
import { contentfulService } from "../contentful/contentfulService";

export default async function Events() {
  const contentful = contentfulService();
  const eventData = await contentful.getEvents();
  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="text-center text-4xl font-bold">Upcoming Events</h1>
        <div>
          {eventData.map((event) => (
            <EventTeaserCard key={event.title} event={event} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
