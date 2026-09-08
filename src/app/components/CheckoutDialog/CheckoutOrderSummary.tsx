"use client";

import { CartTicketType } from "@/store/cartStore.types";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const TicketSummaryCard = ({ ticket }: { ticket: CartTicketType }) => {
  const ticketSubtotal = ticket.price * ticket.quantity;
  const hasAddon =
    Boolean(ticket.selectedAddonContentfulId) && (ticket.addonQuantity ?? 0) > 0;
  const addonSubtotal = hasAddon
    ? (ticket.selectedAddonPrice ?? 0) * (ticket.addonQuantity ?? 0)
    : 0;

  return (
    <div className="bg-black/50 p-4 rounded border border-gold/30">
      <h4 className="text-gold text-lg font-semibold mb-2">{ticket.title}</h4>
      <div className="flex justify-between mb-1 text-sm">
        <span>Base Ticket ({ticket.quantity}):</span>
        <span>${ticketSubtotal.toFixed(2)}</span>
      </div>
      {hasAddon && (
        <div className="flex justify-between mb-1 text-sm">
          <span>
            Addon - {ticket.selectedAddonTitle} ({ticket.addonQuantity}):
          </span>
          <span>${addonSubtotal.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
};

export const CheckoutOrderSummary = ({
  tickets,
  totalPrice,
}: {
  tickets: CartTicketType[];
  totalPrice: number;
}) => {
  const [seeCart, setSeeCart] = useState<boolean>(true);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl">Your Order</h3>
        <button
          className="text-gold text-sm hover:underline"
          type="button"
          onClick={() => setSeeCart(!seeCart)}
        >
          {seeCart ? "Hide Details" : "Show Details"}
        </button>
      </div>

      <AnimatePresence>
        {seeCart && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 mb-4">
              {tickets.map((ticket) => (
                <TicketSummaryCard key={ticket.contentfulTicketId} ticket={ticket} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between text-xl font-bold border-t border-gold pt-3 mt-3">
        <span>Final Total:</span>
        <span>${totalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
};
