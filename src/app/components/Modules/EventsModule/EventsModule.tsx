"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export const EventsModule = () => {
  const features = [
    "Chef Driven",
    "BYOB",
    "Tipping Optional",
    "Meet Dope People",
    "Unscheduled Private Events Available"
  ];

  return (
    <div className="bg-black text-white py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-center mb-12 text-gold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Exclusive Events
        </motion.h2>
        
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-12 md:gap-16 lg:gap-24">
          <motion.div 
            className="w-full md:w-1/2 max-w-md"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-black border-2 border-gold p-8 rounded-xl shadow-xl">
              <h3 className="text-2xl font-bold mb-6 text-center text-gold">Upcoming Events</h3>
              <p className="text-white text-center mb-6 text-lg">
                Explore upcoming dinners and reserve your spot.
              </p>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/events"
                  className="block w-full py-4 px-6 bg-gold text-black text-xl font-bold rounded-lg border-2 border-gold shadow-lg hover:bg-white hover:border-white transition-all duration-300 text-center"
                >
                  View Events
                </Link>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div 
            className="w-full md:w-1/2 max-w-md"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-black border-2 border-gold p-8 rounded-xl shadow-xl">
              <h3 className="text-2xl font-bold mb-6 text-center text-gold">What to Expect</h3>
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <motion.li 
                    key={feature} 
                    className="flex items-center text-xl text-white"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + (index * 0.1) }}
                  >
                    <span className="inline-block w-6 h-6 mr-3 bg-gold rounded-full flex items-center justify-center text-black font-bold">✓</span>
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
