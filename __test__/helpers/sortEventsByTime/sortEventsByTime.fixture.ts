import { ParsedEvent } from "@/app/contentful/contentfulServices.types";
import { BLOCKS } from "@contentful/rich-text-types";

export const eventsFixture: ParsedEvent[] = [
    {
      title: 'In the past event',
      date: new Date(Date.now() - (1000 * 3600 * 24 * 5)), // 5 Days in the past
      price: 58,
      menu: { data: {}, content: [], nodeType: BLOCKS.DOCUMENT },
      shortDescription: 'It was so good, you completely missed out. You should feel bad.',
      tickets: [ ],
      longDescription: { data: {}, content: [], nodeType: BLOCKS.DOCUMENT }
    },
    {
      title: 'Way in the future event',
      date: new Date(Date.now() + (1000 * 3600 * 24 * 35)), // 35 Days in the future
      price: 58,
      menu: { data: {}, content: [], nodeType: BLOCKS.DOCUMENT },
      shortDescription: "This event is way in the future, but it'll be dope",
      tickets: [ ],
      longDescription: { data: {}, content: [], nodeType: BLOCKS.DOCUMENT }
    },
    {
      title: 'Next Event',
      date: new Date(Date.now() + (1000 * 3600 * 24 * 5)), // 5 days in the future
      price: 58,
      menu: { data: {}, content: [], nodeType: BLOCKS.DOCUMENT },
      shortDescription: 'I am having a pop-up on a certain date that is happening in the near future! I am so excited, blah blah blah blah blah',
      tickets: [ ],
      longDescription: { data: {}, content: [], nodeType: BLOCKS.DOCUMENT }
    }
  ]