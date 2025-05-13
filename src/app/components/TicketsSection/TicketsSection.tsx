"use client";
import { ParsedEvent } from "@/app/networkCalls/contentful/contentfulServices.types";
import { Ticket } from "../Ticket/Ticket";
import { motion } from "framer-motion";
import { FaInstagram } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { useCartStore } from "@/store/cartStore";

export const TicketsSection = ({ event }: { event: ParsedEvent }) => {
  const cart = useCartStore((state) => state.cart);
  
  // Calculate total
  const total = cart.tickets.reduce((acc, ticket) => {
    return acc + (ticket.price * ticket.quantity);
  }, 0);
  
  // Check if there are any tickets in the cart (regardless of price)
  const hasItemsInCart = cart.tickets.length > 0;

  // Check if the event is in the past
  const isPastEvent = new Date(event.date) < new Date();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      id="tickets"
      className="text-gold h-auto w-11/12 md:w-10/12 mx-auto my-16 px-4 md:px-8 py-8 md:py-12 bg-black/90 rounded-lg shadow-lg"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center border-b-2 border-gold pb-4 w-3/4 md:w-1/3 mx-auto">
        Available Tickets
      </h2>
      
      {isPastEvent ? (
        <div className="text-center p-8 bg-black/50 rounded-lg border border-gold">
          <p className="text-xl md:text-2xl mb-4">This event has already passed.</p>
          <p className="text-lg">Tickets are no longer available.</p>
        </div>
      ) : (
        event.tickets.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {event.tickets.map((ticket) => (
              <Ticket key={ticket.contentfulTicketId} ticket={ticket} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-black/50 rounded-lg border border-gold">
            <p className="text-xl md:text-2xl mb-4">No tickets are currently available for this event.</p>
            <p className="text-lg">Please check back later or contact us for more information.</p>
          </div>
        )
      )}
      
      {hasItemsInCart && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 max-w-md mx-auto bg-black/70 border-2 border-gold rounded-lg p-6 shadow-lg"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Your Selection</h3>
            <p className="text-xl font-bold">${total.toFixed(2)}</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-gold text-black py-3 px-4 rounded font-bold text-lg hover:bg-white transition-colors"
            onClick={() => {
              const checkoutDialog = document.getElementById('checkout-dialog');
              if (checkoutDialog instanceof HTMLDialogElement) {
                checkoutDialog.showModal();
              }
            }}
          >
            Proceed to Checkout
          </motion.button>
        </motion.div>
      )}
      
      <div className="mt-12 text-center border-t-2 border-gold/30 pt-8">
        <p className="text-lg mb-6">Questions about this event?</p>
        <div className="flex justify-center gap-6">
          <motion.a
            href="mailto:sirkinsupperclub@gmail.com"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-white hover:text-gold transition-colors"
          >
            <MdEmail className="text-2xl" />
            <span>Email Us</span>
          </motion.a>
          <motion.a
            href="https://www.instagram.com/sirkinsupperclub/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-white hover:text-gold transition-colors"
          >
            <FaInstagram className="text-2xl" />
            <span>Instagram</span>
          </motion.a>
        </div>
      </div>
    </motion.section>
  );
}; 