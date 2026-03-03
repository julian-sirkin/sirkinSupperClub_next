"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useCartStore } from "@/store/cartStore";
import { FormData, schema } from "./CheckoutForm.fixture";
import { KeyboardEvent, useRef, useState } from "react";

const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} - ${digits.slice(6)}`;
};

const countDigits = (value: string) => (value.match(/\d/g) ?? []).length;

const getCaretPositionByDigitCount = (value: string, digitCount: number) => {
  if (digitCount <= 0) {
    return 0;
  }

  let seenDigits = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index])) {
      seenDigits += 1;
    }
    if (seenDigits === digitCount) {
      return index + 1;
    }
  }

  return value.length;
};

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
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      dietaryRestrictions: "",
      notes: "",
    },
  });

  const cart = useCartStore((state) => state.cart);
  const disableButton = shouldDisableButton || cart.tickets.length === 0;
  const phoneInputRef = useRef<HTMLInputElement | null>(null);

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
      noValidate
      className="flex flex-col items-center bg-black/80 p-6 rounded-lg shadow-lg"
    >
      {/* Name Input */}
      <span className="flex flex-col mb-4 w-full">
        <label htmlFor="checkout-name" className="font-bold text-gold mb-1">Name</label>
        <input
          id="checkout-name"
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
        <label htmlFor="checkout-email" className="font-bold text-gold mb-1">Email</label>
        <input
          id="checkout-email"
          {...register("email")}
          className="h-10 w-full text-black rounded-md p-2"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="name@example.com"
        />
        {errors.email && (
          <p className="text-red-500">{String(errors.email.message)}</p>
        )}
      </span>

      {/* Phone Number Input */}
      <span className="flex flex-col mb-4 w-full">
        <label htmlFor="checkout-phone-number" className="font-bold text-gold mb-1">Phone Number</label>
        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => {
            const handlePhoneKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
              if (event.key !== "Backspace") {
                return;
              }

              const cursorStart = event.currentTarget.selectionStart ?? 0;
              const cursorEnd = event.currentTarget.selectionEnd ?? 0;
              if (cursorStart !== cursorEnd || cursorStart === 0) {
                return;
              }

              const inputValue = event.currentTarget.value;
              const previousCharacter = inputValue[cursorStart - 1];

              if (/\d/.test(previousCharacter)) {
                return;
              }

              let previousDigitIndex = cursorStart - 2;
              while (previousDigitIndex >= 0 && !/\d/.test(inputValue[previousDigitIndex])) {
                previousDigitIndex -= 1;
              }

              if (previousDigitIndex < 0) {
                return;
              }

              event.preventDefault();
              const rawWithDeletedDigit =
                inputValue.slice(0, previousDigitIndex) +
                inputValue.slice(previousDigitIndex + 1);
              const nextValue = formatPhoneNumber(rawWithDeletedDigit);
              const digitsBeforeDeletedPosition = countDigits(
                inputValue.slice(0, previousDigitIndex)
              );
              const nextCaretPosition = getCaretPositionByDigitCount(
                nextValue,
                digitsBeforeDeletedPosition
              );

              field.onChange(nextValue);

              requestAnimationFrame(() => {
                if (phoneInputRef.current) {
                  phoneInputRef.current.setSelectionRange(
                    nextCaretPosition,
                    nextCaretPosition
                  );
                }
              });
            };

            return (
              <input
                id="checkout-phone-number"
                value={field.value ?? ""}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(formatPhoneNumber(event.target.value))}
                onKeyDown={handlePhoneKeyDown}
                name={field.name}
                ref={(element) => {
                  field.ref(element);
                  phoneInputRef.current = element;
                }}
                className="h-10 w-full text-black rounded-md p-2"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={16}
                placeholder="(123) 456 - 7890"
              />
            );
          }}
        />
        {errors.phoneNumber && (
          <p className="text-red-500">{String(errors.phoneNumber.message)}</p>
        )}
      </span>

      {/* Dietary Restrictions Input */}
      <span className="flex flex-col mb-4 w-full">
        <label htmlFor="checkout-dietary-restrictions" className="font-bold text-gold mb-1">Dietary Restrictions</label>
        <input
          id="checkout-dietary-restrictions"
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
        <label htmlFor="checkout-notes" className="font-bold text-gold mb-1">Notes</label>
        <textarea id="checkout-notes" {...register("notes")} className="h-24 w-full text-black rounded-md p-2" />
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
