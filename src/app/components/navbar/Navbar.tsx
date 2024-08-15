"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { IoClose } from "react-icons/io5";

export const Navbar = () => {
  const [shouldDisplayMenu, setShouldDisplayMenu] = useState<boolean>(false);

  const handleToggleMenu = (e: React.MouseEvent) => {
    setShouldDisplayMenu(!shouldDisplayMenu);
  };

  return (
    <header className="bg-black h-18 py-6 md:py-0">
      <nav className="flex justify-between items-center px-8">
        <div className="text-gold">
          <Image
            src="/logo/main_logo.png"
            alt="Sirkin Supper Club Logo"
            width={96}
            height={96}
          />
        </div>
        <div
          className={`md:static absolute bg-black md:min-h-fit md:w-auto min-h-[30vh] left-0 ${
            shouldDisplayMenu ? "top-[64px]" : "top-[-100%]"
          } w-full flex items-center`}
        >
          <ul className="flex md:flex-row flex-col md:items-centered md:gap-[4vw] gap-6 px-4">
            <li>
              <a
                className="text-gold px-4 py-2 font-bold hover:text-white hover:bg-gold"
                href="#"
              >
                Home
              </a>
            </li>
            <li>
              <a
                className="text-gold px-4 py-2 font-bold hover:text-white hover:bg-gold"
                href="#"
              >
                Events
              </a>
            </li>
            <li>
              <a
                className="text-gold px-4 py-2 font-bold hover:text-white hover:bg-gold"
                href="#"
              >
                About
              </a>
            </li>
            <li>
              <a
                className="text-gold px-4 py-2 font-bold hover:text-white hover:bg-gold"
                href="#"
              >
                Pictures
              </a>
            </li>
            <li>
              <a
                className="text-gold px-4 py-2 font-bold hover:text-white hover:bg-gold"
                href="#"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div className="text-gold absolute top-6 right-4">
          {shouldDisplayMenu ? (
            <IoClose
              onClick={handleToggleMenu}
              color="white"
              className="text-2xl cursor-pointer md:hidden"
            />
          ) : (
            <CiMenuBurger
              onClick={handleToggleMenu}
              color="white"
              className="text-2xl cursor-pointer md:hidden"
            />
          )}
        </div>
      </nav>
    </header>
  );
};
