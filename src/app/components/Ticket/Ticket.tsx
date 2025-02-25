"use client";
import {
  ParsedEvent,
  ParsedTicket,
} from "@/app/networkCalls/contentful/contentfulServices.types";
import { TicketSelect } from "./TicketSelect";
import { useCartStore } from "@/store/cartStore";
import { motion } from "framer-motion";

export const Ticket = ({
  ticket,
  event,
}: {
  ticket: ParsedTicket;
  event: ParsedEvent;
}) => {
  const updateCart = useCartStore((state) => state.updateCart);
  const ticketsArray = new Array(ticket.ticketsAvailable + 1)
    .fill(1)
    .map((__, index) => index);

  const handleChangeQuantity = (numberOfTickets: number) => {
    updateCart({
      ...ticket,
      quantity: numberOfTickets,
      eventContentfulId: event.contentfulEventId,
    });
  };
  console.log(ticket.price, 'ticket price')

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        boxShadow: "0 20px 25px -5px rgba(212, 175, 55, 0.3)",
        translateY: -5
      }}
      className="border-2 md:border-4 border-white p-4 md:p-6 bg-black opacity-95 mb-6 w-full md:w-[400px] rounded-lg"
    >
      <div className="h-[60px] mb-6">
        <h4 className="text-gold text-xl font-bold md:text-2xl overflow-hidden line-clamp-2">
          {ticket.title}
        </h4>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <section>
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gold" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <h5 className="text-white text-lg">
              {ticket.time.toLocaleString("en-us", {
                hour: "numeric",
                minute: "numeric",
              })}
            </h5>
          </div>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gold" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            <h5 className="text-white text-lg">{ticket.price}</h5>
          </div>
        </section>
        {ticketsArray.length > 1 ? (
          <TicketSelect
            availableTickets={ticketsArray}
            handleChangeQuantity={handleChangeQuantity}
            ticketTitle={ticket.title}
          />
        ) : (
          <div className="bg-red-600/20 border border-red-600 text-red-600 text-center font-bold w-full md:w-[180px] py-3 px-4 rounded">
            Sold Out
          </div>
        )}
      </div>
    </motion.div>
  );
};
