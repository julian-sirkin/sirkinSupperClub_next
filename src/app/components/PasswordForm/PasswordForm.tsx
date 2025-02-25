"use client";

import { redirectToEvents } from "@/app/actions";
import { useState } from "react";
import { motion } from "framer-motion";

export const PasswordForm = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);

  return (
    <motion.form
      action={redirectToEvents}
      className="w-full max-w-md flex flex-col gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <motion.input
          type="password"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Enter password"
          className="w-full px-6 py-4 text-lg bg-black text-white border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-gold transition-all duration-300"
          whileFocus={{ scale: 1.02 }}
        />
        <motion.span
          className="absolute left-0 -top-6 text-gold font-semibold text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: isFocused || inputValue ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          Password for Secret Events
        </motion.span>
      </div>
      
      <motion.button
        type="submit"
        className="w-full py-4 px-6 bg-gold text-black text-xl font-bold rounded-lg border-2 border-gold shadow-lg hover:shadow-xl transition-all duration-300"
        whileHover={{ scale: 1.03, backgroundColor: "#ffffff", borderColor: "#ffffff" }}
        whileTap={{ scale: 0.98 }}
      >
        Discover Upcoming Events
      </motion.button>
    </motion.form>
  );
};
