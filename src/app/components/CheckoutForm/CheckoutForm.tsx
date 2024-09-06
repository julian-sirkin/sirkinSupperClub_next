"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";
import { useCartStore } from "@/store/cartStore";

const schema = z.object({
  name: z.string().trim().min(1, {
    message: "Name is required",
  }),
  email: z.string().trim().email({ message: "Invalid email address" }),
  phoneNumber: z
    .string()
    .regex(
      /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/,
      "Invalid phone number"
    ),
  notes: z.string().trim().optional(),
  dietaryRestrictions: z.string().trim().optional(),
});

type FormData = z.infer<typeof schema>;

export const CheckoutForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const cart = useCartStore((state) => state.cart);

  const onSubmit = (data: FormData) => {
    console.log(data);
    console.log(data, "data");

    const claimTicketBody = { ...data };
  };

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
        className="mx-auto h-14 w-52 bg-gold text-white font-bold text-2xl hover:cursor-pointer"
      >
        Checkout
      </button>
    </form>
  );
};
