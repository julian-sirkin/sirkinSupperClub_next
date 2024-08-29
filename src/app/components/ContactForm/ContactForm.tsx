"use client";

import { useState, FormEvent } from "react";

const successToastMessage = "Comment Successfully emailed";
const failToastMessage =
  "Failed to pass along message, please email or dm directly";

export const ContactForm = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [formSubmissionMessage, setFormSubmissionMessage] = useState("");

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await fetch("api/email", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ name, phoneNumber, email, comment }),
    });
    if (response.status === 200) {
      setFormSubmissionMessage(successToastMessage);

      setComment("");
    } else {
      setFormSubmissionMessage(failToastMessage);
    }
    setName("");
    setPhoneNumber("");
    setEmail("");
    setTimeout(() => {
      setFormSubmissionMessage("");
    }, 10000);
  };

  return (
    <form
      className="flex flex-col gap-4 mx-auto w-11/12 md:w-96 justify-center"
      onSubmit={handleFormSubmit}
    >
      <span className="flex flex-col">
        <label>Name</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
      </span>
      <span className="flex flex-col">
        <label>Phone number</label>
        <input
          type="number"
          id="phoneNumber"
          name="phone number"
          placeholder="Phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.currentTarget.value)}
        />
      </span>
      <span className="flex flex-col">
        <label>Email</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
      </span>
      <span className="flex flex-col">
        <label>Comment</label>
        <textarea
          className="h-32"
          id="comment"
          name="comment"
          placeholder="comment"
          value={comment}
          onChange={(e) => setComment(e.currentTarget.value)}
        />
      </span>
      <button
        type="submit"
        className="bg-black text-white hover:bg-white hover:text-black hover:cursor-pointer text-lg font-bold p-2"
      >
        Submit Inquiry
      </button>
      <div
        className={`h-auto p-2 text-center text-xl font-bold ${
          formSubmissionMessage === successToastMessage
            ? "text-green-700 bg-black"
            : ""
        }
        ${
          formSubmissionMessage === failToastMessage
            ? "text-red-600 bg-black"
            : ""
        }
        `}
        aria-label="Contact form submission toast"
      >
        {formSubmissionMessage}
      </div>
    </form>
  );
};
