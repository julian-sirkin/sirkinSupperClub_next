"use client";
import { motion } from "framer-motion";

export const EventTitle = ({ title, date }: { title: string; date: Date }) => {
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="text-center py-12 md:py-16 mt-6 md:mt-8 bg-black/80 border-b-4 border-gold"
    >
      <h1 className="text-3xl md:text-5xl font-bold text-gold mb-4 px-4">
        {title}
      </h1>
      <p className="text-xl md:text-2xl text-white">
        {formattedDate}
      </p>
    </motion.div>
  );
}; 