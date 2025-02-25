"use client";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { EVENT_RICHTEXT_OPTIONS } from "./EventRichTextOptions";
import type { Document } from "@contentful/rich-text-types";
import { motion } from "framer-motion";

export const EventLongDescription = ({
  description,
}: {
  description: Document;
}) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      id="description"
      className="text-gold h-auto w-auto md:w-9/12 mx-auto bg-black/90 px-6 md:px-12 py-12 mb-8 rounded-lg shadow-lg border-l-4 border-gold"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center md:text-left">Event Details</h2>
      <div className="event-description prose prose-invert prose-gold max-w-none">
        {documentToReactComponents(description, EVENT_RICHTEXT_OPTIONS)}
      </div>
      <motion.div 
        className="text-right mt-8"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <a 
          href="#menu" 
          className="inline-block bg-gold text-black px-4 py-2 rounded font-bold hover:bg-white transition-colors"
        >
          View Menu
        </a>
      </motion.div>
    </motion.section>
  );
};
