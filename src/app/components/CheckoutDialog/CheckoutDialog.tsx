"use client";

import { ParsedEvent } from "@/app/networkCalls/contentful/contentfulServices.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/schad/components/ui/dialog";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import { CheckoutForm } from "../CheckoutForm/CheckoutForm";
import { FormData } from "../CheckoutForm/CheckoutForm.fixture";
import { CheckoutResponseMessage } from "../CheckoutForm/CheckoutResponseMessage";

export const CheckoutDialog = ({ event }: { event: ParsedEvent }) => {
  const [seeCart, setSeeCart] = useState<boolean>(true);
  const [shouldShowForm, setShouldShowForm] = useState<boolean>(true);
  const [shouldDisableSubmitButton, setShouldDisableSubmitButton] =
    useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { cart, emptyCart } = useCartStore((state) => ({
    cart: state.cart,
    emptyCart: state.emptyCart,
  }));

  const onSubmit = async (data: FormData) => {
    setShouldDisableSubmitButton(true);
    const body = JSON.stringify({ ...data, purchasedTickets: cart.tickets });

    const response = await fetch("/api/claimTickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    const decodedResponse = await response.json();
    setShouldDisableSubmitButton(false);
    setShouldShowForm(false);
    if (decodedResponse.status !== 200) {
      setErrorMessage(decodedResponse.message);
      setTimeout(() => {
        setErrorMessage("");
        setShouldShowForm(true);
        setShouldDisableSubmitButton(false);
      }, 15000);
    } else {
      emptyCart();
    }
  };

  return (
    <Dialog>
      <div className="flex justify-center">
        <DialogTrigger className="h-20 w-48 bg-black text-3xl text-white text-center font-bold hover:underline hover:text-gold">
          Checkout
        </DialogTrigger>
      </div>
      <DialogContent className="bg-black text-white w-11/12 p-6 md:p-12 ">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl">
            Reserve Your Spot
          </DialogTitle>
          <DialogDescription>
            <ul className="text-left md:mb-6">
              {seeCart ? (
                <>
                  {cart.tickets.map((ticketInCart) => (
                    <li key={ticketInCart.title} className="text-gold mb-6">
                      <h3 className="text-gold text-lg font-semibold">
                        {ticketInCart.title}
                      </h3>

                      {/* Flexbox layout for Quantity and Price with values aligned to the right */}
                      <div className="flex justify-between mb-2">
                        <h4 className="text-md text-white">Quantity:</h4>
                        <p className="text-md text-white text-right">
                          {ticketInCart.quantity}
                        </p>
                      </div>
                      <div className="flex justify-between mb-2">
                        <h5 className="text-md text-white">Price:</h5>
                        <p className="text-md text-white text-right">
                          ${ticketInCart.price * ticketInCart.quantity}
                        </p>
                      </div>
                    </li>
                  ))}
                  <button
                    className="text-gold"
                    type="button"
                    name="hide cart contents"
                    onClick={() => setSeeCart(!seeCart)}
                  >
                    Hide Cart
                  </button>
                </>
              ) : (
                <button
                  className="text-gold"
                  name="show cart contents"
                  type="button"
                  onClick={() => setSeeCart(!seeCart)}
                >
                  Show Cart
                </button>
              )}
              {/* Total */}
              <li className="flex justify-between text-xl text-white mt-4">
                <span>Total:</span>
                <span className="text-right">${cart.totalPrice}</span>
              </li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        {shouldShowForm ? (
          <CheckoutForm
            onSubmit={onSubmit}
            shouldDisableButton={shouldDisableSubmitButton}
          />
        ) : (
          <CheckoutResponseMessage errorMessage={errorMessage} />
        )}
      </DialogContent>
    </Dialog>
  );
};
