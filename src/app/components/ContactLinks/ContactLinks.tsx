"use client";

import { FaInstagram } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { AiFillTikTok } from "react-icons/ai";
import Link from "next/link";
import { motion } from "framer-motion";

export const ContactLinks = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-black backdrop-blur-sm p-6 rounded-lg shadow-md transform hover:translate-y-[-2px] transition-all duration-300 border border-gray-700 w-full md:w-auto"
      style={{ boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}
    >
      <h3 className="text-2xl font-bold text-white mb-4">Connect With Us</h3>
      
      <motion.ul 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4"
      >
        <motion.li variants={item} className="group">
          <Link 
            href="mailto:sirkinsupperclub@gmail.com"
            className="flex items-center gap-4 text-xl md:text-2xl font-bold text-white transition-transform duration-300 group-hover:translate-x-2"
          >
            <div className="bg-gray-800 p-2 rounded-full shadow-sm">
              <MdEmail className="text-gold" />
            </div>
            <span className="border-b-2 border-transparent group-hover:border-white transition-all duration-300 truncate">
              sirkinsupperclub@gmail.com
            </span>
          </Link>
        </motion.li>
        
        <motion.li variants={item} className="group">
          <Link
            href="https://www.instagram.com/julian.sirkin/"
            className="flex items-center gap-4 text-xl md:text-2xl font-bold text-white transition-transform duration-300 group-hover:translate-x-2"
          >
            <div className="bg-gray-800 p-2 rounded-full shadow-sm">
              <FaInstagram className="text-gold" />
            </div>
            <span className="border-b-2 border-transparent group-hover:border-white transition-all duration-300">
              Julian.Sirkin
            </span>
          </Link>
        </motion.li>
        
        <motion.li variants={item} className="group">
          <Link
            href="https://www.instagram.com/sirkinsupperclub/"
            className="flex items-center gap-4 text-xl md:text-2xl font-bold text-white transition-transform duration-300 group-hover:translate-x-2"
          >
            <div className="bg-gray-800 p-2 rounded-full shadow-sm">
              <FaInstagram className="text-gold" />
            </div>
            <span className="border-b-2 border-transparent group-hover:border-white transition-all duration-300">
              sirkinsupperclub
            </span>
          </Link>
        </motion.li>
        
        <motion.li variants={item} className="group">
          <Link
            href="https://www.tiktok.com/@sirkinsupperclub"
            className="flex items-center gap-4 text-xl md:text-2xl font-bold text-white transition-transform duration-300 group-hover:translate-x-2"
          >
            <div className="bg-gray-800 p-2 rounded-full shadow-sm">
              <AiFillTikTok className="text-gold" />
            </div>
            <span className="border-b-2 border-transparent group-hover:border-white transition-all duration-300">
              sirkinsupperclub
            </span>
          </Link>
        </motion.li>
      </motion.ul>
    </motion.div>
  );
};
