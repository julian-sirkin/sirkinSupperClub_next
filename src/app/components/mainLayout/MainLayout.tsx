import React from "react";
import { Navbar } from "../navbar/Navbar";
import { Footer } from "../Footer/Footer";

type MainLayoutProps = {
  children: React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="h-dvh">
      <Navbar />
      <div>{children}</div>
      <Footer />
    </div>
  );
};
