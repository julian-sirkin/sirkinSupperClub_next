"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import { navLinkTypes } from "../componentsTypes";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export const Navbar = ({ linkData }: { linkData: navLinkTypes[] }) => {
  const [shouldDisplayMenu, setShouldDisplayMenu] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [currentHash, setCurrentHash] = useState("");
  const pathname = usePathname();

  // Handle menu toggle
  const handleToggleMenu = () => {
    setShouldDisplayMenu(!shouldDisplayMenu);
  };

  // Handle scroll behavior and hash changes
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

    // Set current hash
    if (typeof window !== 'undefined') {
      setCurrentHash(window.location.hash);
    }

    // Listen for hash changes
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("hashchange", handleHashChange);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [lastScrollY]);

  // Check if a link is active
  const isLinkActive = (href: string) => {
    // For hash links like "#about", check if they're in the current URL
    if (href.startsWith('#')) {
      return currentHash === href;
    }
    
    // For regular links, check if the pathname matches
    return pathname === href;
  };

  return (
    <>
      {/* This is a fixed spacer that always takes up the same amount of space as the navbar */}
      <div className="h-[80px] w-full"></div>
      
      <AnimatePresence>
        {isVisible && (
          <motion.header
            initial={{ y: -80 }}
            animate={{ y: 0 }}
            exit={{ y: -80 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 bg-black shadow-md"
          >
            <nav className="flex justify-between items-center px-8 py-3">
              <div className="text-gold flex flex-col items-center md:flex-row md:items-center md:justify-start w-full md:w-auto">
                <div className="flex flex-col items-center md:flex-row md:items-center">
                  <Link href="/">
                    <Image
                      src="/logo/main_logo.png"
                      alt="Sirkin Supper Club Logo"
                      width={72}
                      height={72}
                      className="mx-auto md:mx-0"
                    />
                  </Link>
                  {shouldDisplayMenu ? (
                    <IoClose
                      onClick={handleToggleMenu}
                      color="white"
                      className="text-2xl md:hidden cursor-pointer mx-auto md:ml-4 md:mx-0"
                    />
                  ) : (
                    <CiMenuBurger
                      onClick={handleToggleMenu}
                      color="white"
                      className="text-2xl md:hidden cursor-pointer mx-auto md:ml-4 md:mx-0"
                    />
                  )}
                </div>
              </div>
              <div
                className={`md:static absolute bg-black md:min-h-fit md:w-auto min-h-[30vh] left-0 ${
                  shouldDisplayMenu ? "top-[120px]" : "hidden md:block"
                } w-full flex items-center`}
              >
                <ul className="flex md:flex-row flex-col md:items-center md:gap-[4vw] bg-black gap-10 px-4 z-50 w-full mx-auto items-center py-8 md:py-0">
                  {linkData.map((link) => {
                    const active = isLinkActive(link.href);
                    return (
                      <motion.li 
                        key={link.displayName}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          className={`px-4 py-4 md:py-2 md:mb-0 font-bold transition-colors duration-300 ${
                            active 
                              ? "text-gold bg-black md:border-b-2 md:border-gold" 
                              : "text-white md:text-white hover:text-gold"
                          }`}
                          href={link.href}
                          onClick={() => {
                            if (shouldDisplayMenu) {
                              setShouldDisplayMenu(false);
                            }
                          }}
                        >
                          {link.displayName}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            </nav>
          </motion.header>
        )}
      </AnimatePresence>
    </>
  );
};
