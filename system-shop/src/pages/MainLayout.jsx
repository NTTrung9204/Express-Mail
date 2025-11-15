import React, { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";


const MainLayout = () => {

    useEffect(() => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
          window.location.href = "http://localhost:3000/admin/login";
      }
    }, []);

  return (
    <div className="flex min-h-screen bg-[#fff8f5]"> 
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      <main className="flex-1 p-6 overflow-auto max-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
