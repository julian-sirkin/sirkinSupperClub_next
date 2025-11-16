import { adminEvent } from '@/app/api/api.types';

export interface OrganizedEvents {
  upcomingEvents: adminEvent[];
  pastEventsByYear: {
    [year: string]: adminEvent[];
  };
}

export const organizeAdminEvents = (events: adminEvent[]): OrganizedEvents => {
  const now = new Date();
  // Set to start of day for fair comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const upcomingEvents: adminEvent[] = [];
  const pastEventsByYear: { [year: string]: adminEvent[] } = {};

  events.forEach((event) => {
    const eventDate = new Date(event.date);
    // Set event date to start of day for comparison
    const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    
    if (eventDateOnly >= today) {
      // Event is upcoming (including today)
      upcomingEvents.push(event);
    } else {
      // Event is in the past, group by year
      const year = eventDate.getFullYear().toString();
      if (!pastEventsByYear[year]) {
        pastEventsByYear[year] = [];
      }
      pastEventsByYear[year].push(event);
    }
  });

  // Sort upcoming events by date (earliest first)
  upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Sort past events within each year by date (most recent first)
  Object.keys(pastEventsByYear).forEach((year) => {
    pastEventsByYear[year].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  return {
    upcomingEvents,
    pastEventsByYear
  };
}; 