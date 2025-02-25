/* eslint-disable react/no-unescaped-entities */
"use client";

import { EventModule } from "@/app/components/EventModule/EventModule";
import { ParsedEvent } from "@/app/networkCalls/contentful/contentfulServices.types";
import { 
  AlertBanner, 
  FadeIn, 
  SlideUp, 
  HoverScale 
} from "@/app/components/animations/AnimatedElements";

export default function AnimatedEventPage({ 
  eventOnPage, 
  dbError 
}: { 
  eventOnPage: ParsedEvent | null, 
  dbError: boolean 
}) {
  if (eventOnPage) {
    return (
      <>
        {dbError && (
          <AlertBanner className="mb-4">
            <p className="font-bold">Note</p>
            <p>Ticket availability information may not be accurate. Please contact us to confirm availability.</p>
          </AlertBanner>
        )}
        <FadeIn>
          <EventModule event={eventOnPage} />
        </FadeIn>
      </>
    );
  }
  
  return (
    <SlideUp className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      <FadeIn delay={0.2}>
        <h1 className="text-4xl font-bold text-gold mb-6">
          Event Not Found
        </h1>
      </FadeIn>
      <FadeIn delay={0.4}>
        <p className="text-xl mb-8">
          We couldn't find the event you&apos;re looking for.
        </p>
      </FadeIn>
      <FadeIn delay={0.6}>
        <HoverScale>
          <a 
            href="/events" 
            className="bg-gold text-black px-6 py-3 rounded font-bold hover:bg-white transition-colors"
          >
            View All Events
          </a>
        </HoverScale>
      </FadeIn>
    </SlideUp>
  );
} 