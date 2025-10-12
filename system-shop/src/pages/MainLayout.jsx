import React from "react";
import Sidebar from "../components/Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#fff8f5]"> 
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      <main className="flex-1 p-6 overflow-auto max-h-screen">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
