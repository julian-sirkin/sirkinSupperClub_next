"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useCartStore } from "@/store/cartStore";
import { FormData, schema } from "./CheckoutForm.fixture";

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
  console.log(cart, "cart");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center"
    >
      {/* Name Input */}
      <span className="flex flex-col mb-4">
        <label className="font-bold text-gold mb-2">Name</label>
        <input
          {...register("name")}
          className="h-8 w-52 text-black"
          type="text"
        />
        {errors.name && (
          <p className="text-red-500">{String(errors.name.message)}</p>
        )}
      </span>

      {/* Email Input */}
      <span className="flex flex-col mb-4 ">
        <label className="font-bold text-gold mb-2">Email</label>
        <input
          {...register("email")}
          className="h-8 w-52 text-black"
          type="email"
        />
        {errors.email && (
          <p className="text-red-500">{String(errors.email.message)}</p>
        )}
      </span>

      {/* Phone Number Input */}
      <span className="flex flex-col mb-4">
        <label className="font-bold text-gold mb-2">Phone Number</label>
        <input
          {...register("phoneNumber")}
          className="h-8 w-52 text-black"
          type="tel"
        />
        {errors.phoneNumber && (
          <p className="text-red-500">{String(errors.phoneNumber.message)}</p>
        )}
      </span>

      {/* Dietary Restrictions Input */}
      <span className="flex flex-col mb-4">
        <label className="font-bold text-gold mb-2">Dietary Restrictions</label>
        <input
          {...register("dietaryRestrictions")}
          className="h-8 w-52 text-black"
          type="text"
        />
        {errors.dietaryRestrictions && (
          <p className="text-red-500">
            {String(errors.dietaryRestrictions.message)}
          </p>
        )}
      </span>

      {/* Notes Input */}
      <span className="flex flex-col mb-6">
        <label className="font-bold text-gold mb-2">Notes</label>
        <textarea {...register("notes")} className="h-16 w-52 text-black" />
        {errors.notes && (
          <p className="text-red-500">{String(errors.notes.message)}</p>
        )}
      </span>
      <button
        type="submit"
        disabled={shouldDisableButton}
        className="mx-auto h-14 w-52 bg-gold text-white font-bold text-2xl hover:cursor-pointer"
      >
        Checkout
      </button>
    </form>
  );
};
