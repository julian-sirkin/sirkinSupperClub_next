"use client";

import { ParsedEvent } from "@/app/networkCalls/contentful/contentfulServices.types";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import { CheckoutForm } from "../CheckoutForm/CheckoutForm";
import { FormData } from "../CheckoutForm/CheckoutForm.fixture";
import { CheckoutResponseMessage } from "../CheckoutForm/CheckoutResponseMessage";
import { motion, AnimatePresence } from "framer-motion";
import { claimTickets } from "@/app/lib/apiClient";

export const CheckoutDialog = ({ event }: { event: ParsedEvent }) => {
  const [seeCart, setSeeCart] = useState<boolean>(true);
  const [shouldShowForm, setShouldShowForm] = useState<boolean>(true);
  const [shouldDisableSubmitButton, setShouldDisableSubmitButton] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { cart, emptyCart } = useCartStore((state) => ({
    cart: state.cart,
    emptyCart: state.emptyCart,
  }));

  const onSubmit = async (data: FormData) => {
    setShouldDisableSubmitButton(true);
    const requestBody = { ...data, purchasedTickets: cart.tickets };

    try {
      const response = await claimTickets(requestBody);
      const decodedResponse = await response.json();
      
      setShouldDisableSubmitButton(false);
      setShouldShowForm(false);
      
      if (!response.ok) {
        setErrorMessage(decodedResponse.message || 'Ticket claim failed');
        setTimeout(() => {
          setErrorMessage("");
          setShouldShowForm(true);
          setShouldDisableSubmitButton(false);
        }, 15000);
      } else {
        emptyCart();
      }
    } catch (error) {
        console.error("Error claiming tickets:", error);
        setErrorMessage("An unexpected network error occurred. Please try again.");
        setShouldDisableSubmitButton(false);
        setShouldShowForm(false);
         setTimeout(() => {
          setErrorMessage("");
          setShouldShowForm(true);
        }, 15000);
    }
  };

  const closeDialog = () => {
    const dialog = document.getElementById('checkout-dialog');
    if (dialog instanceof HTMLDialogElement) {
      dialog.close();
    }
  };

  return (
    <dialog 
      id="checkout-dialog" 
      className="bg-transparent p-0 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="bg-black border-2 border-gold text-white w-[90vw] max-w-md p-4 md:p-6 rounded-lg shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b border-gold pb-2">
          <h2 className="text-2xl md:text-3xl font-bold text-gold">
            Reserve Your Spot
          </h2>
          <button 
            onClick={closeDialog}
            className="text-white hover:text-gold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl">Your Order</h3>
            <button
              className="text-gold text-sm hover:underline"
              type="button"
              onClick={() => setSeeCart(!seeCart)}
            >
              {seeCart ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          <AnimatePresence>
            {seeCart && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 mb-4">
                  {cart.tickets.map((ticketInCart) => (
                    <div key={ticketInCart.title} className="bg-black/50 p-4 rounded border border-gold/30">
                      <h4 className="text-gold text-lg font-semibold mb-2">
                        {ticketInCart.title}
                      </h4>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Quantity:</span>
                        <span>{ticketInCart.quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Price:</span>
                        <span>${ticketInCart.price * ticketInCart.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex justify-between text-xl font-bold border-t border-gold/30 pt-2 mt-2">
            <span>Total:</span>
            <span>${cart.totalPrice}</span>
          </div>
        </div>
        
        {shouldShowForm ? (
          <CheckoutForm
            onSubmit={onSubmit}
            shouldDisableButton={shouldDisableSubmitButton}
          />
        ) : (
          <CheckoutResponseMessage errorMessage={errorMessage} />
        )}
      </div>
    </dialog>
  );
};
