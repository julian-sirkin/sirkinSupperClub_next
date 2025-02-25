"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export const DynamicNavbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-90 shadow-md"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-gold text-2xl font-bold">
                Sirkin Supper Club
              </Link>
              
              <div className="flex space-x-6">
                <Link href="/#about" className="text-white hover:text-gold transition-colors duration-300">
                  About
                </Link>
                <Link href="/#events" className="text-white hover:text-gold transition-colors duration-300">
                  Events
                </Link>
                <Link href="/#contact" className="text-white hover:text-gold transition-colors duration-300">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}; 