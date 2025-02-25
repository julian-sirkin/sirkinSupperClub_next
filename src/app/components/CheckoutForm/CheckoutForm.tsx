"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCartStore } from "@/store/cartStore";
import { FormData, schema } from "./CheckoutForm.fixture";
import { useState } from "react";

export const CheckoutForm = ({
  onSubmit,
  shouldDisableButton,
}: {
  onSubmit: (data: FormData) => Promise<void>;
  shouldDisableButton: boolean;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const cart = useCartStore((state) => state.cart);
  const disableButton = shouldDisableButton || cart.tickets.length === 0;

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFormSubmit = async (data: FormData) => {
    setIsLoading(true); // Set loading state to true
    await onSubmit(data);
    setIsLoading(false); // Reset loading state after submission
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col items-center bg-black/80 p-6 rounded-lg shadow-lg"
    >
      {/* Name Input */}
      <span className="flex flex-col mb-4 w-full">
        <label className="font-bold text-gold mb-1">Name</label>
        <input
          {...register("name")}
          className="h-10 w-full text-black rounded-md p-2"
          type="text"
        />
        {errors.name && (
          <p className="text-red-500">{String(errors.name.message)}</p>
        )}
      </span>

      {/* Email Input */}
      <span className="flex flex-col mb-4 w-full">
        <label className="font-bold text-gold mb-1">Email</label>
        <input
          {...register("email")}
          className="h-10 w-full text-black rounded-md p-2"
          type="text"
        />
        {errors.email && (
          <p className="text-red-500">{String(errors.email.message)}</p>
        )}
      </span>

      {/* Phone Number Input */}
      <span className="flex flex-col mb-4 w-full">
        <label className="font-bold text-gold mb-1">Phone Number</label>
        <input
          {...register("phoneNumber")}
          className="h-10 w-full text-black rounded-md p-2"
          type="tel"
        />
        {errors.phoneNumber && (
          <p className="text-red-500">{String(errors.phoneNumber.message)}</p>
        )}
      </span>

      {/* Dietary Restrictions Input */}
      <span className="flex flex-col mb-4 w-full">
        <label className="font-bold text-gold mb-1">Dietary Restrictions</label>
        <input
          {...register("dietaryRestrictions")}
          className="h-10 w-full text-black rounded-md p-2"
          type="text"
        />
        {errors.dietaryRestrictions && (
          <p className="text-red-500">
            {String(errors.dietaryRestrictions.message)}
          </p>
        )}
      </span>

      {/* Notes Input */}
      <span className="flex flex-col mb-4 w-full">
        <label className="font-bold text-gold mb-1">Notes</label>
        <textarea {...register("notes")} className="h-24 w-full text-black rounded-md p-2" />
        {errors.notes && (
          <p className="text-red-500">{String(errors.notes.message)}</p>
        )}
      </span>

      <button
        type="submit"
        disabled={disableButton || isLoading} // Disable button if loading
        className="h-12 w-full mt-4 bg-gold text-white font-bold text-lg rounded-md hover:bg-white hover:text-black transition-colors"
      >
        {isLoading ? "Processing..." : "Checkout"} {/* Show loading text */}
      </button>
    </form>
  );
};
