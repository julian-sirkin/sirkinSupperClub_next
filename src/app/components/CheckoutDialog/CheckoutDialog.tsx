"use client";

import { ParsedEvent } from "@/app/networkCalls/contentful/contentfulServices.types";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useRef, useState } from "react";
import { CheckoutForm } from "../CheckoutForm/CheckoutForm";
import { FormData } from "../CheckoutForm/CheckoutForm.fixture";
import { CheckoutSuccessMessage } from "../CheckoutForm/CheckoutSuccessMessage";
import { CheckoutOrderSummary } from "./CheckoutOrderSummary";
import { claimTickets } from "@/app/lib/apiClient";
import { CartTicketType } from "@/store/cartStore.types";
import { isPresaleActive } from "@/app/helpers/validatePresaleAccess";

type SubmittedOrder = {
  tickets: CartTicketType[];
  totalPrice: number;
  email: string;
};

export const CheckoutDialog = ({ event }: { event: ParsedEvent }) => {
  const [shouldShowForm, setShouldShowForm] = useState<boolean>(true);
  const [shouldDisableSubmitButton, setShouldDisableSubmitButton] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string>("");
  const [submittedOrder, setSubmittedOrder] = useState<SubmittedOrder | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const presaleIsActive = isPresaleActive({
    presaleEnabled: event.presaleEnabled,
    presaleEndsAt: event.presaleEndsAt,
  });

  const { cart, emptyCart } = useCartStore((state) => ({
    cart: state.cart,
    emptyCart: state.emptyCart,
  }));

  const onSubmit = async (data: FormData) => {
    setSubmissionError("");
    setShouldDisableSubmitButton(true);

    // Snapshotted before the request because a successful order empties the cart.
    setSubmittedOrder({
      tickets: cart.tickets.map((ticket) => ({ ...ticket })),
      totalPrice: cart.totalPrice,
      email: data.email,
    });

    const requestBody = {
      ...data,
      presalePassword: data.presalePassword ?? "",
      purchasedTickets: cart.tickets,
      clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    try {
      const response = await claimTickets(requestBody);
      const decodedResponse = await response.json();

      setShouldDisableSubmitButton(false);

      if (!response.ok) {
        const inlineMessage =
          decodedResponse?.error?.data ||
          decodedResponse?.error?.message ||
          decodedResponse?.message ||
          "Ticket claim failed";
        setSubmissionError(inlineMessage);
        setShouldShowForm(true);
        return;
      }

      setShouldShowForm(false);
      emptyCart();
    } catch (error) {
      console.error("Error claiming tickets:", error);
      setSubmissionError("An unexpected network error occurred. Please try again.");
      setShouldDisableSubmitButton(false);
      setShouldShowForm(true);
    }
  };

  const closeDialog = () => {
    const dialog = document.getElementById("checkout-dialog");
    if (dialog instanceof HTMLDialogElement) {
      dialog.close();
    }
  };

  const isSuccessfulOrderState = !shouldShowForm;

  // On a phone the dialog is scrolled down to the submit button, so the
  // confirmation would otherwise open below the fold.
  useEffect(() => {
    if (!isSuccessfulOrderState) {
      return;
    }

    scrollContainerRef.current?.scrollTo?.({ top: 0 });
  }, [isSuccessfulOrderState]);

  return (
    <dialog
      id="checkout-dialog"
      className="bg-transparent p-0 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div
        ref={scrollContainerRef}
        className="bg-black border-2 border-gold text-white w-[90vw] max-w-md max-h-[85vh] overflow-y-auto p-4 md:p-6 rounded-lg shadow-2xl"
      >
        <div className="flex justify-between items-center mb-4 border-b border-gold pb-2">
          <h2 className="text-2xl md:text-3xl font-bold text-gold">
            {isSuccessfulOrderState ? "Order Confirmed" : "Reserve Your Spot"}
          </h2>
          <button onClick={closeDialog} className="text-white hover:text-gold" aria-label="Close">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* The confirmation lists the tickets itself, so the summary would duplicate it. */}
        {shouldShowForm ? (
          <>
            <CheckoutOrderSummary tickets={cart.tickets} totalPrice={cart.totalPrice} />
            <CheckoutForm
              onSubmit={onSubmit}
              shouldDisableButton={shouldDisableSubmitButton}
              isPresaleActive={presaleIsActive}
              submissionError={submissionError}
            />
          </>
        ) : (
          <CheckoutSuccessMessage
            tickets={submittedOrder?.tickets ?? []}
            totalPrice={submittedOrder?.totalPrice ?? 0}
            customerEmail={submittedOrder?.email ?? ""}
          />
        )}
      </div>
    </dialog>
  );
};
