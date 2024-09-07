import { ParsedEvent } from "@/app/networkCalls/contentful/contentfulServices.types";
import { BLOCKS } from "@contentful/rich-text-types";

export const eventsFixture: ParsedEvent[] = [
    {
      title: 'In the past event',
      contentfulEventId: 'abcdef',
      date: new Date(Date.now() - (1000 * 3600 * 24 * 5)), // 5 Days in the past
      price: 58,
      menu: { data: {}, content: [], nodeType: BLOCKS.DOCUMENT },
      shortDescription: 'It was so good, you completely missed out. You should feel bad.',
      tickets: [ ],
      longDescription: { data: {}, content: [], nodeType: BLOCKS.DOCUMENT }
    },
    {
      title: 'Way in the future event',
      contentfulEventId: 'hijklmnop',
      date: new Date(Date.now() + (1000 * 3600 * 24 * 35)), // 35 Days in the future
      price: 58,
      menu: { data: {}, content: [], nodeType: BLOCKS.DOCUMENT },
      shortDescription: "This event is way in the future, but it'll be dope",
      tickets: [ ],
      longDescription: { data: {}, content: [], nodeType: BLOCKS.DOCUMENT }
    },
    {
      title: 'Next Event',
      contentfulEventId: 'qrstuvwxyz',
      date: new Date(Date.now() + (1000 * 3600 * 24 * 5)), // 5 days in the future
      price: 58,
      menu: { data: {}, content: [], nodeType: BLOCKS.DOCUMENT },
      shortDescription: 'I am having a pop-up on a certain date that is happening in the near future! I am so excited, blah blah blah blah blah',
      tickets: [ ],
      longDescription: { data: {}, content: [], nodeType: BLOCKS.DOCUMENT }
    }
  ]

  const mockCartTicket1: CartTicketType = {
    contentfulTicketId: 'ticket1',
    eventContentfulId: 'event1',
    quantity: 2,
    price: 100,
    time: new Date(),
    title: 'Test',
    isAddonTicket: false,
    ticketsAvailable: 10
};

const mockCartTicket2: CartTicketType = {
    contentfulTicketId: 'ticket2',
    eventContentfulId: 'event2',
    quantity: 3,
    price: 100,
    time: new Date(),
    title: 'Test',
    isAddonTicket: false,
    ticketsAvailable: 10
};

const mockDatabaseTicket1: DatabaseTickets = {
    ticket: {
        time: null,
        id: 1,
        event: 1,
        contentfulId: 'ticket1',
        totalAvailable: 10,
        totalSold: 5
    }
};

const mockDatabaseTicket2: DatabaseTickets = {
    ticket: {
        time: null,
        id: 2,
        event: 2,
        contentfulId: 'ticket2',
        totalAvailable: 10,
        totalSold: 3
    }
};