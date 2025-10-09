import React from "react";
import Sidebar from "../components/common/Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#fff8f5]"> {/* nền nhẹ ấm giống dashboard */}
      {/* Sidebar cố định bên trái */}
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Nội dung chính */}
      <main className="flex-1 p-6 overflow-auto max-h-screen">
        <Outlet/>
      </main>
    </div>
  );
};

export default MainLayout;
