import React, { useState } from "react";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";

const MainLayout = ({ children }) => {
  const [title, setTitle] = useState("Dashboard");

  return (
    <div className="flex">
      <Sidebar setTitle={setTitle} />

      <div className="flex-1 bg-orange-50 ml-64 h-screen flex flex-col">
        <div className="fixed top-0 left-64 right-0 z-40">
          <Header title={title} />
        </div>

        <div className="flex-1 overflow-auto pt-16 p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
