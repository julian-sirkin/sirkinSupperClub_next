"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

// Animation variants
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7 } }
};

// Animation components
export const FadeIn = ({ children, delay = 0, className = "" }: { children: ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.7, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export const SlideUp = ({ children, delay = 0, className = "" }: { children: ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerContainer = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, delay = 0, className = "" }: { children: ReactNode, delay?: number, className?: string }) => (
  <motion.div
    variants={itemVariants}
    transition={{ delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export const HoverScale = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={className}
  >
    {children}
  </motion.div>
);

export const AlertBanner = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 ${className}`}
    role="alert"
  >
    {children}
  </motion.div>
); 