import { EventTeaserCard } from "../components/EventTeaserCard/EventTeaserCard";
import { MainLayout } from "../components/mainLayout/MainLayout";
import { contentfulService } from "../networkCalls/contentful/contentfulService";
import { ParsedEvent } from "../networkCalls/contentful/contentfulServices.types";
import { sortEventsByTime } from "../helpers/sortEventsByTime";
import { Suspense } from "react";
import { SuspenseFallback } from "../components/SuspenseFallback/SuspenseFallback";
import { default as dynamicImport } from "next/dynamic";

// Dynamically import client components
const AnimatedEventsPage = dynamicImport(() => import('./AnimatedEventsPage'), {
  ssr: false,
  loading: () => <SuspenseFallback />
});

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
      <Suspense fallback={<SuspenseFallback />}>
        <AnimatedEventsPage 
          upcomingEvents={upcomingEvents} 
          pastEvents={pastEvents} 
          dbError={dbError} 
        />
      </Suspense>
    </MainLayout>
  );
}
