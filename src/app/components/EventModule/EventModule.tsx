"use client";

import { ParsedEvent } from "@/app/networkCalls/contentful/contentfulServices.types";
import { EventLongDescription } from "../EventLongDescription/EventLongDescription";
import { Menu } from "../Menu/Menu";
import { EventTitle } from "../EventTitle/EventTitle";
import { TicketsSection } from "../TicketsSection/TicketsSection";
import { CheckoutDialog } from "../CheckoutDialog/CheckoutDialog";

export const EventModule = ({ event }: { event: ParsedEvent }) => {
  return (
    <div className="bg-communal_table bg-cover bg-fixed min-h-screen">
      <EventTitle title={event.title} date={event.date} />
      
      <div className="container mx-auto px-4 pt-8 pb-2 md:pt-12">
        <Menu menu={event.menu} price={event.price} />
        <EventLongDescription description={event.longDescription} />
        <TicketsSection event={event} />
        <CheckoutDialog event={event} />
      </div>
    </div>
  );
};
