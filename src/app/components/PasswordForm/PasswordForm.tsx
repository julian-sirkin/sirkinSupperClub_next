"use client";

import { redirectToEvents } from "@/app/actions";
import { useState } from "react";

export const PasswordForm = () => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <form
      action={redirectToEvents}
      className="w-auto flex items-center md:items-end justify-center flex-col gap-4 md:gap-8"
    >
      <input
        type="password"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Password for Secret Events"
        className="text-black text-lg text-center w-80 h-14"
      />
      <button
        type="submit"
        className="bg-black text-2xl text-gold h-14 w-80 hover:cursor-pointer"
      >
        See Upcoming Events
      </button>
    </form>
  );
};
