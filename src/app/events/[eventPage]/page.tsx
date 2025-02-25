import { MainLayout } from "@/app/components/mainLayout/MainLayout";
import { contentfulService } from "@/app/networkCalls/contentful/contentfulService";
import { headers } from "next/headers";
import { eventPageLinks } from "./EventPage.constants";
import { ParsedEvent } from "@/app/networkCalls/contentful/contentfulServices.types";
import { Suspense } from "react";
import { SuspenseFallback } from "@/app/components/SuspenseFallback/SuspenseFallback";
import { default as dynamicImport } from "next/dynamic";

// Dynamically import client components
const AnimatedEventPage = dynamicImport(() => import('./AnimatedEventPage'), {
  ssr: false,
  loading: () => <SuspenseFallback />
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EventPage() {
  // Get Events
  const contentful = contentfulService();
  
  let eventData: ParsedEvent[] = [];
  let eventOnPage: ParsedEvent | null = null;
  let dbError = false;
  
  try {
    // Always try the fallback first to avoid database errors
    eventData = await contentful.getEventsWithoutDB();
    
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
      <Suspense fallback={<SuspenseFallback />}>
        <AnimatedEventPage 
          eventOnPage={eventOnPage} 
          dbError={dbError} 
        />
      </Suspense>
    </MainLayout>
  );
}
