"use client";

import { motion } from "framer-motion";
import { ContactForm } from "../../ContactForm/ContactForm";
import { ContactLinks } from "../../ContactLinks/ContactLinks";

const ContactModule = () => {
  return (
    <section id="contact" className="bg-gold min-h-screen px-4 md:px-8 py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="container mx-auto max-w-6xl relative z-10"
      >
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl md:text-6xl text-white text-center font-bold mb-12 drop-shadow-lg"
        >
          Get in Touch
        </motion.h2>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
          <ContactLinks />
          <ContactForm />
        </div>
      </motion.div>
    </section>
  );
};

export default ContactModule;
