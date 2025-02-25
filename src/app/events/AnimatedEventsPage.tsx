"use client";

import { ParsedEvent } from "../networkCalls/contentful/contentfulServices.types";
import { EventTeaserCard } from "../components/EventTeaserCard/EventTeaserCard";
import { 
  AlertBanner, 
  FadeIn, 
  SlideUp, 
  StaggerContainer, 
  StaggerItem,
  HoverScale
} from "../components/animations/AnimatedElements";
import { motion } from "framer-motion";

export default function AnimatedEventsPage({ 
  upcomingEvents, 
  pastEvents, 
  dbError 
}: { 
  upcomingEvents: ParsedEvent[], 
  pastEvents: ParsedEvent[],
  dbError: boolean
}) {
  const hasUpcomingEvents = upcomingEvents.length > 0;
  const hasPastEvents = pastEvents.length > 0;
  const hasMultipleUpcomingEvents = upcomingEvents.length > 1;

  return (
    <>
      {dbError && (
        <AlertBanner>
          <p className="font-bold">Note</p>
          <p>Ticket availability information may not be accurate. Please contact us to confirm availability.</p>
        </AlertBanner>
      )}
      
      <FadeIn className="h-auto p-4 md:p-12 bg-communal_table bg-cover">
        {hasUpcomingEvents ? (
          <SlideUp delay={0.2}>
            <motion.div 
              whileHover={{ 
                boxShadow: "0 20px 25px -5px rgba(212, 175, 55, 0.25)",
                scale: 1.01
              }}
              initial={{ boxShadow: "none" }}
              transition={{ duration: 0.3 }}
              className="flex justify-center"
            >
              <EventTeaserCard event={upcomingEvents[0]} isFeaturedEvent={true} />
            </motion.div>
          </SlideUp>
        ) : (
          <FadeIn delay={0.2} className="text-center p-12 bg-black/80 text-white rounded-lg border-2 border-gold">
            <h2 className="text-3xl font-bold mb-4 text-gold">No Upcoming Events</h2>
            <p className="text-xl mb-6">Check back soon for new events!</p>
            {hasPastEvents && (
              <HoverScale>
                <a href="#past-events" className="inline-block bg-gold text-black px-6 py-3 rounded font-bold hover:bg-white transition-colors">
                  View Past Events
                </a>
              </HoverScale>
            )}
          </FadeIn>
        )}
      </FadeIn>
      
      {hasMultipleUpcomingEvents && (
        <StaggerContainer className="bg-black p-6 md:p-12">
          <StaggerItem>
            <h2 className="mt-8 md:mt-12 mb-12 text-2xl md:text-4xl text-center md:text-left text-white">
              <span className="border-b-2 border-gold pb-2">Other Upcoming Events</span>
            </h2>
          </StaggerItem>

          <div className="flex flex-col items-center md:flex-row md:justify-center md:flex-wrap gap-6 md:gap-8">
            {upcomingEvents.slice(1).map((event, index) => (
              <StaggerItem key={event.title} delay={0.1 * index}>
                <motion.div
                  whileHover={{ 
                    boxShadow: "0 10px 15px -3px rgba(212, 175, 55, 0.2)",
                    translateY: -5
                  }}
                  initial={{ boxShadow: "none" }}
                  transition={{ duration: 0.2 }}
                  className="w-full flex justify-center"
                >
                  <EventTeaserCard
                    event={event}
                    isFeaturedEvent={false}
                  />
                </motion.div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      )}
      
      {hasPastEvents && (
        <StaggerContainer id="past-events" className="bg-black p-6 md:p-12 border-t border-gray-800">
          <StaggerItem>
            <h3 className="mt-8 md:mt-12 mb-12 text-2xl md:text-4xl text-center md:text-left text-white">
              <span className="border-b-2 border-gold pb-2">Past Events</span>
            </h3>
          </StaggerItem>
          <div className="flex flex-col items-center md:flex-row md:justify-center md:flex-wrap gap-6 md:gap-8">
            {pastEvents.map((event, index) => (
              <StaggerItem key={event.title} delay={0.1 * index}>
                <motion.div
                  whileHover={{ 
                    boxShadow: "0 10px 15px -3px rgba(212, 175, 55, 0.2)",
                    translateY: -5
                  }}
                  initial={{ boxShadow: "none" }}
                  transition={{ duration: 0.2 }}
                  className="w-full flex justify-center opacity-90 hover:opacity-100"
                >
                  <EventTeaserCard
                    event={event}
                    isFeaturedEvent={false}
                  />
                </motion.div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      )}
    </>
  );
} 