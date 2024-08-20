import React from "react";
import { Navbar } from "../navbar/Navbar";
import { Footer } from "../Footer/Footer";
import { defaultNavLinks } from "./MainLayout.constants";
import { navLinkTypes } from "../componentsTypes";

type MainLayoutProps = {
  children: React.ReactNode;
  navLinks?: navLinkTypes[];
};

export const MainLayout = ({
  children,
  navLinks = defaultNavLinks,
}: MainLayoutProps) => {
  return (
    <div className="h-dvh">
      <Navbar linkData={navLinks} />
      <div>{children}</div>
      <Footer />
    </div>
  );
};
