"use client";

import { useCartStore } from "@/store/cartStore";
import { motion } from "framer-motion";

export const CartTotalDisplay = () => {
  const cart = useCartStore((state) => state.cart);
  
  // Calculate total
  const total = cart.tickets.reduce((acc, ticket) => {
    return acc + (ticket.price * ticket.quantity);
  }, 0);
  
  if (total <= 0) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-4 right-4 md:bottom-8 md:right-8 bg-black border-2 border-gold p-4 rounded-lg shadow-lg z-40"
    >
      <div className="flex flex-col items-end">
        <p className="text-white text-lg mb-2">
          <span className="font-bold">Total:</span> ${total.toFixed(2)}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gold text-black px-4 py-2 rounded font-bold hover:bg-white transition-colors"
          onClick={() => {
            const checkoutDialog = document.getElementById('checkout-dialog');
            if (checkoutDialog instanceof HTMLDialogElement) {
              checkoutDialog.showModal();
            }
          }}
        >
          Checkout
        </motion.button>
      </div>
    </motion.div>
  );
};
