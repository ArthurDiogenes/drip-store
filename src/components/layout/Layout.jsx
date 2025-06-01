import React from "react";
import Header from "./Header";
import Footer from "./Footer";


const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow pt-16 md:pt-[150px]">{children}</main>

      <Footer />
    </div>
  );
};

export default Layout;
