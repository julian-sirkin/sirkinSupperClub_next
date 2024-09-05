"use client";

import { ParsedEvent } from "@/app/contentful/contentfulServices.types";
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

export const CheckoutDialog = ({ event }: { event: ParsedEvent }) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [seeCart, setSeeCart] = useState<boolean>(true);

  const cart = useCartStore((state) => state.cart);

  return (
    <Dialog>
      <div className="flex justify-center">
        <DialogTrigger className="h-20 w-40 bg-black text-3xl text-white text-center font-bold">
          Checkout
        </DialogTrigger>
      </div>
      <DialogContent className="bg-black text-white w-auto md:w-11/12 p-12 ">
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
        <form className="flex flex-col items-center">
          {/* Name Input */}
          <span className="flex flex-col mb-4">
            <label className="font-bold text-gold mb-2">Name</label>
            <input
              className="h-8 w-52 text-black"
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </span>

          {/* Email Input */}
          <span className="flex flex-col mb-4 ">
            <label className="font-bold text-gold mb-2">Email</label>
            <input
              className="h-8 w-52 text-black"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
          </span>

          {/* Phone Number Input */}
          <span className="flex flex-col mb-4">
            <label className="font-bold text-gold mb-2">Phone Number</label>
            <input
              className="h-8 w-52 text-black"
              type="tel"
              name="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.currentTarget.value)}
            />
          </span>

          {/* Dietary Restrictions Input */}
          <span className="flex flex-col mb-4">
            <label className="font-bold text-gold mb-2">
              Dietary Restrictions
            </label>
            <input
              className="h-8 w-52 text-black"
              type="text"
              name="dietaryRestrictions"
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.currentTarget.value)}
            />
          </span>

          {/* Notes Input */}
          <span className="flex flex-col mb-6">
            <label className="font-bold text-gold mb-2">Notes</label>
            <textarea
              className="h-16 w-52 text-black"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.currentTarget.value)}
            />
          </span>
          <button
            type="submit"
            className="mx-auto h-14 w-52 bg-gold text-white"
          >
            Checkout
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
