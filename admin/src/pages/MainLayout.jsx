import Sidebar from "../components/common/Sidebar";
import React, { useEffect} from "react";
import { useNavigate, Outlet } from "react-router-dom";

const MainLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar/>

      <div className="flex-1 bg-orange-50 ml-64 h-screen flex flex-col">

      <div className="flex flex-col flex-1">
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  </div>
  );
}

export default MainLayout
