import { EventModule } from "@/app/components/EventModule/EventModule";
import { MainLayout } from "@/app/components/mainLayout/MainLayout";
import { contentfulService } from "@/app/contentful/contentfulService";
import { headers } from "next/headers";

export default async function EventPage() {
  // Get Events
  const contentful = contentfulService();
  const eventData = await contentful.getEvents();
  /**
   * Get Event Title based on URL to populate the page with the right event
   */
  const headerList = headers();
  const pathName = headerList.get("x-pathname") || "potato";
  const eventTitleInURL = decodeURIComponent(
    pathName.substring(pathName.lastIndexOf("/") + 1)
  );

  const eventOnPage = eventData.filter(
    (event) => event.title === eventTitleInURL
  )[0].event;

  return (
    <MainLayout>
      {eventOnPage ? (
        <EventModule event={eventOnPage} />
      ) : (
        <div>sad, no event</div>
      )}
    </MainLayout>
  );
}
