import { organizeAdminEvents } from '../organizeAdminEvents';
import { adminEvent } from '@/app/api/api.types';

describe('organizeAdminEvents', () => {
  const mockEvents: adminEvent[] = [
    {
      id: 1,
      title: 'Future Event 1',
      date: new Date('2030-06-15').getTime(),
      ticketsAvailable: 50,
      ticketsSold: 20
    },
    {
      id: 2,
      title: 'Future Event 2',
      date: new Date('2030-03-10').getTime(),
      ticketsAvailable: 30,
      ticketsSold: 15
    },
    {
      id: 3,
      title: 'Past Event 2024',
      date: new Date('2024-12-25').getTime(),
      ticketsAvailable: 40,
      ticketsSold: 40
    },
    {
      id: 4,
      title: 'Past Event 2023',
      date: new Date('2023-08-15').getTime(),
      ticketsAvailable: 25,
      ticketsSold: 25
    },
    {
      id: 5,
      title: 'Another Past Event 2024',
      date: new Date('2024-06-10').getTime(),
      ticketsAvailable: 35,
      ticketsSold: 30
    }
  ];

  it('should organize events into upcoming and past events by year', () => {
    console.log('Current date:', new Date());
    console.log('Mock events:', mockEvents.map(e => ({ title: e.title, date: new Date(e.date) })));
    
    const result = organizeAdminEvents(mockEvents);
    
    console.log('Result:', result);
    
    // Check upcoming events (should be sorted by date ascending)
    expect(result.upcomingEvents).toHaveLength(2);
    expect(result.upcomingEvents[0].title).toBe('Future Event 2'); // March 2030
    expect(result.upcomingEvents[1].title).toBe('Future Event 1'); // June 2030
    
    // Check past events by year
    expect(Object.keys(result.pastEventsByYear)).toHaveLength(2);
    expect(result.pastEventsByYear['2024']).toHaveLength(2);
    expect(result.pastEventsByYear['2023']).toHaveLength(1);
    
    // Check that past events within each year are sorted by date descending (most recent first)
    expect(result.pastEventsByYear['2024'][0].title).toBe('Past Event 2024'); // December 2024
    expect(result.pastEventsByYear['2024'][1].title).toBe('Another Past Event 2024'); // June 2024
  });

  it('should handle empty events array', () => {
    const result = organizeAdminEvents([]);
    
    expect(result.upcomingEvents).toHaveLength(0);
    expect(Object.keys(result.pastEventsByYear)).toHaveLength(0);
  });

  it('should handle events with same date as current date', () => {
    const today = new Date();
    const todayEvents: adminEvent[] = [
      {
        id: 1,
        title: 'Today Event',
        date: today.getTime(),
        ticketsAvailable: 50,
        ticketsSold: 20
      }
    ];
    
    const result = organizeAdminEvents(todayEvents);
    
    // Events with today's date should be considered upcoming
    expect(result.upcomingEvents).toHaveLength(1);
    expect(result.upcomingEvents[0].title).toBe('Today Event');
  });
}); 