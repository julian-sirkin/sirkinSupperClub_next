"use client";
import { PictureItem } from "@/app/networkCalls/contentful/contentfulServices.types";
import Image from "next/image";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./PictureCard.css";

export const PictureCard = ({ title, description, url }: PictureItem) => {
  const [shouldShowDescription, setShouldShowDescription] = useState(false);

  const toggleShouldShowDescription = () => {
    setShouldShowDescription(!shouldShowDescription);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="bg-gold h-auto min-h-96 w-60 px-6 py-4 mb-6 border-4 border-white rounded-lg shadow-lg overflow-hidden flex flex-col"
    >
      <h4 className="text-center text-xl mb-4 h-16 font-bold flex items-center justify-center">
        {title}
      </h4>
      
      <AnimatePresence mode="wait">
        {shouldShowDescription ? (
          <motion.div
            key="description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-grow flex flex-col"
          >
            <div className="flex justify-center border-4 border-black rounded-md overflow-hidden bg-white mb-4 flex-grow">
              <div className="pictureSizing text-center text-md p-4 overflow-y-auto text-black">
                {description}
              </div>
            </div>
            <motion.button
              onClick={toggleShouldShowDescription}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full text-center text-lg mt-auto mb-2 hover:cursor-pointer bg-black text-white py-2 rounded-md font-medium transition-colors duration-300 hover:bg-white hover:text-black"
            >
              Show Image
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-grow flex flex-col"
          >
            <div className="border-4 border-black rounded-md overflow-hidden mb-4 flex-grow">
              <Image
                src={url}
                alt={title}
                height={300}
                width={300}
                className="pictureSizing object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <motion.button
              onClick={toggleShouldShowDescription}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full text-center text-lg mt-auto mb-2 hover:cursor-pointer bg-black text-white py-2 rounded-md font-medium transition-colors duration-300 hover:bg-white hover:text-black"
            >
              See Description
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
