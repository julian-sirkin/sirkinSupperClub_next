"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";

const successToastMessage = "Comment Successfully emailed";
const failToastMessage =
  "Failed to pass along message, please email or dm directly";
const noContactInforIncludedMessage =
  "Please Add an email or phone number and try again";

export const ContactForm = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [formSubmissionMessage, setFormSubmissionMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!(phoneNumber || email)) {
      setFormSubmissionMessage(noContactInforIncludedMessage);
      setTimeout(() => {
        setFormSubmissionMessage("");
      }, 3000);
    } else {
      setIsSubmitting(true);
      // Call email endpoint
      try {
        const response = await fetch("api/email", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ name, phoneNumber, email, comment }),
        });

        // Handle Responses
        if (response.status === 200) {
          setFormSubmissionMessage(successToastMessage);
          setComment("");
        } else {
          setFormSubmissionMessage(failToastMessage);
        }

        // Clean up form
        setName("");
        setPhoneNumber("");
        setEmail("");
      } catch (error) {
        setFormSubmissionMessage(failToastMessage);
      } finally {
        setIsSubmitting(false);
        setTimeout(() => {
          setFormSubmissionMessage("");
        }, 5000);
      }
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:w-[509px] gap-5 p-6 bg-black backdrop-blur-sm rounded-lg shadow-md transform hover:translate-y-[-2px] transition-all duration-300 border border-gray-700"
      style={{ boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}
      onSubmit={handleFormSubmit}
    >
      <h3 className="text-2xl font-bold text-white mb-2">Get in Touch</h3>
      
      <div className="flex flex-col">
        <label className="font-bold text-white mb-1">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          className="p-3 rounded border-2 border-transparent focus:border-white focus:outline-none transition-all duration-300 bg-gray-800 text-white"
        />
      </div>
      
      <div className="flex flex-col">
        <label className="font-bold text-white mb-1">Phone number</label>
        <input
          type="tel"
          id="phoneNumber"
          name="phone number"
          placeholder="Your phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.currentTarget.value)}
          className="p-3 rounded border-2 border-transparent focus:border-white focus:outline-none transition-all duration-300 bg-gray-800 text-white"
        />
      </div>
      
      <div className="flex flex-col">
        <label className="font-bold text-white mb-1">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          className="p-3 rounded border-2 border-transparent focus:border-white focus:outline-none transition-all duration-300 bg-gray-800 text-white"
        />
      </div>
      
      <div className="flex flex-col">
        <label className="font-bold text-white mb-1">Comment</label>
        <textarea
          className="h-32 p-3 rounded border-2 border-transparent focus:border-white focus:outline-none transition-all duration-300 bg-gray-800 text-white"
          id="comment"
          name="comment"
          placeholder="What would you like to tell us?"
          value={comment}
          onChange={(e) => setComment(e.currentTarget.value)}
        />
      </div>
      
      <motion.button
        type="submit"
        whileHover={{ scale: 1.05, backgroundColor: "#333", color: "#fff" }}
        whileTap={{ scale: 0.95 }}
        disabled={isSubmitting}
        className="bg-black text-white transition-colors duration-300 text-lg font-bold p-3 rounded shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Sending..." : "Submit Inquiry"}
      </motion.button>
      
      {formSubmissionMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-3 rounded-md text-center text-lg font-bold ${
            formSubmissionMessage === successToastMessage
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
          aria-label="Contact form submission toast"
        >
          {formSubmissionMessage}
        </motion.div>
      )}
    </motion.form>
  );
};
