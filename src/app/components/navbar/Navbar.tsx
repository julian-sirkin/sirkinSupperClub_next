"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import { navLinkTypes } from "../componentsTypes";

export const Navbar = ({ linkData }: { linkData: navLinkTypes[] }) => {
  const [shouldDisplayMenu, setShouldDisplayMenu] = useState<boolean>(false);

  const handleToggleMenu = (e: React.MouseEvent) => {
    setShouldDisplayMenu(!shouldDisplayMenu);
  };

  return (
    <header className="bg-black h-18 py-6 md:py-0">
      <nav className="flex justify-between items-center px-8">
        <div className="text-gold flex flex-col items-center md:flex-row md:items-center md:justify-start w-full md:w-auto">
          <div className="flex flex-col items-center md:flex-row md:items-center">
            <Image
              src="/logo/main_logo.png"
              alt="Sirkin Supper Club Logo"
              width={96}
              height={96}
              className="mx-auto md:mx-0"
            />
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
            shouldDisplayMenu ? "top-[165px]" : "hidden md:block"
          } w-full flex items-center`}
        >
          <ul className="flex md:flex-row flex-col md:items-centered md:gap-[4vw] bg-black gap-10 px-4 z-50 w-full mx-auto items-center py-8">
            {linkData.map((linkData) => (
              <li key={linkData.displayName}>
                <Link
                  className="text-white md:text-gold px-4 py-4 md:py-2 md:mb-0 font-bold md:hover:text-white md:hover:bg-gold"
                  href={linkData.href}
                >
                  {linkData.displayName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-gold absolute top-6 right-4"></div>
      </nav>
    </header>
  );
};
