import React from "react";
import { Navbar } from "../navbar/Navbar";

type MainLayoutProps = {
  children: React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="h-dvh">
      <Navbar />
      <div>{children}</div>
      <div>More layout</div>
    </div>
  );
};
