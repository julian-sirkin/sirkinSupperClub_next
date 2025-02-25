"use client";

import { ParsedEvent } from "@/app/networkCalls/contentful/contentfulServices.types";
import { Ticket } from "../Ticket/Ticket";
import { Menu } from "../Menu/Menu";
import { EventLongDescription } from "../EventLongDescription/EventLongDescription";
import PhotosModule from "../Modules/PhotosModule/PhotosModule";
import { CheckoutDialog } from "../CheckoutDialog/CheckoutDialog";
import { CartTotalDisplay } from "./CartTotalDisplay";
import { motion } from "framer-motion";

export const EventModule = ({ event }: { event: ParsedEvent }) => {
  return (
    <div className="h-auto py-16 bg-black">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-3xl md:text-6xl pb-4 md:pb-6 text-center font-bold text-gold"
      >
        {event.title}
      </motion.h1>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="h-auto bg-communal_table bg-cover py-4 md:py-16"
      >
        <Menu menu={event.menu} price={event.price} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <EventLongDescription description={event.longDescription} />
      </motion.div>
      
      <div className="border-b-8 border-b-white" />
      
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        id="tickets"
        aria-label="Ticket Section"
        className="w-auto md:w-1/2 border-2 md:border-4 border-gold mx-auto md:px-6 py-6 md:py-10 bg-gold mt-8 md:mt-12 mb-12 shadow-lg"
      >
        <h3 className="text-white text-bold font-bold text-2xl md:text-5xl text-center mb-4 md:mb-4">
          Tickets
        </h3>
        <div id="Tickets container" className="mb-6 flex flex-col items-center">
          {event.tickets.map((ticket, index) => (
            <motion.div
              key={ticket.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + (index * 0.1) }}
            >
              <Ticket ticket={ticket} event={event} />
            </motion.div>
          ))}
          <CartTotalDisplay />
        </div>

        <CheckoutDialog event={event} />
      </motion.section>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.8 }}
      >
        <PhotosModule />
      </motion.div>
    </div>
  );
};
