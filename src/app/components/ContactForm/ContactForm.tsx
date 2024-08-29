"use client";

import { useState, FormEvent } from "react";

export const ContactForm = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");

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
    console.log(await response.json());
  };

  return (
    <form className="flex flex-col gap-4 w-96" onSubmit={handleFormSubmit}>
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
    </form>
  );
};
