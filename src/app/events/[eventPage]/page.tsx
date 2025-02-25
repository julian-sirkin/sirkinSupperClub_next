import { EventModule } from "@/app/components/EventModule/EventModule";
import { MainLayout } from "@/app/components/mainLayout/MainLayout";
import { contentfulService } from "@/app/networkCalls/contentful/contentfulService";
import { headers } from "next/headers";
import { eventPageLinks } from "./EventPage.constants";
import { ParsedEvent } from "@/app/networkCalls/contentful/contentfulServices.types";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EventPage() {
  // Get Events
  console.log('Fetching event data from Contentful');
  const contentful = contentfulService();
  
  let eventData: ParsedEvent[] = [];
  let eventOnPage: ParsedEvent | null = null;
  let dbError = false;
  
  try {
    // Always try the fallback first to avoid database errors
    eventData = await contentful.getEventsWithoutDB();
    console.log('Successfully fetched events without DB integration');
    
    // Try to get DB-enhanced data, but don't fail if it doesn't work
    try {
      const dbEventData = await contentful.getEvents();
      // If we got here, DB connection worked, use the enhanced data
      eventData = dbEventData;
    } catch (dbErr) {
      console.error('Error fetching events with DB integration:', dbErr);
      dbError = true;
      // We already have the fallback data, so continue
    }
  } catch (fallbackError) {
    console.error('Critical error: Failed to fetch events:', fallbackError);
    // We'll handle this case in the UI
  }
  
  /**
   * Get Event Title based on URL to populate the page with the right event
   */
  const headerList = headers();
  const pathName = headerList.get("x-pathname") || "";
  const eventTitleInURL = decodeURIComponent(
    pathName.substring(pathName.lastIndexOf("/") + 1)
  );
  
  console.log('Looking for event with title:', eventTitleInURL);
  
  if (eventData.length > 0) {
    eventOnPage = eventData.find(event => event.title === eventTitleInURL) || null;
  }
  
  return (
    <MainLayout navLinks={eventPageLinks}>
      {eventOnPage ? (
        <>
          {dbError && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
              <p className="font-bold">Note</p>
              <p>Ticket availability information may not be accurate. Please contact us to confirm availability.</p>
            </div>
          )}
          <EventModule event={eventOnPage} />
        </>
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
          <h1 className="text-4xl font-bold text-gold mb-6">Event Not Found</h1>
          <p className="text-xl mb-8">We couldn't find the event you're looking for.</p>
          <a href="/events" className="bg-gold text-black px-6 py-3 rounded font-bold hover:bg-white transition-colors">
            View All Events
          </a>
        </div>
      )}
    </MainLayout>
  );
}
