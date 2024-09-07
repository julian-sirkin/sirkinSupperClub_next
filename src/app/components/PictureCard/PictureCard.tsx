"use client";
import { PictureItem } from "@/app/networkCalls/contentful/contentfulServices.types";
import Image from "next/image";
import React, { useState } from "react";
import "./PictureCard.css";

export const PictureCard = ({ title, description, url }: PictureItem) => {
  const [shouldShowDescription, setShouldShowDescription] = useState(false);

  const toggleShouldShowDescription = () => {
    setShouldShowDescription(!shouldShowDescription);
  };
  return (
    <div className="bg-gold h-96 w-60 px-6 py-4 mb-6 border-4 border-white">
      <h4 className="text-center text-xl mb-2 h-16">{title}</h4>
      {shouldShowDescription ? (
        <div>
          <div className="flex justify-center border-4 border-black">
            <p className="pictureSizing text-center text-md pt-10">
              {description}
            </p>
          </div>
          <p
            onClick={toggleShouldShowDescription}
            className="text-center text-lg mt-3 hover:cursor-pointer"
          >
            Show Image
          </p>
        </div>
      ) : (
        <div>
          <Image
            src={url}
            alt={title}
            height={300}
            width={300}
            className="pictureSizing border-4 border-black"
          />
          <p
            onClick={toggleShouldShowDescription}
            className="text-center text-lg mt-3 hover:cursor-pointer"
          >
            See Description
          </p>
        </div>
      )}
    </div>
  );
};
