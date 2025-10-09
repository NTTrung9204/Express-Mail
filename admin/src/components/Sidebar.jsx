import React from "react";
import { Dashboard, People, Warehouse } from "@mui/icons-material";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const linkStyle =
    "flex items-center gap-2 p-3 rounded-lg hover:bg-orange-100 transition";
  const activeStyle = "bg-orange-500 text-white hover:bg-orange-500";

  return (
    <div className="w-64 bg-white h-screen shadow-md p-4 flex flex-col justify-between">
      <div>
        <h1 className="text-xl font-bold mb-8">Admin Panel</h1>
        <nav className="flex flex-col gap-2">
          <NavLink to="/" end className={({isActive})=>`${linkStyle} ${isActive?activeStyle:""}`}>
            <Dashboard /> Dashboard
          </NavLink>
          <NavLink to="/users" className={({isActive})=>`${linkStyle} ${isActive?activeStyle:""}`}>
            <People /> Quản lý Người dùng
          </NavLink>
          <NavLink to="/warehouses" className={({isActive})=>`${linkStyle} ${isActive?activeStyle:""}`}>
            <Warehouse /> Quản lý Kho
          </NavLink>
        </nav>
      </div>
      <div className="text-xs text-gray-500">
        Admin Dashboard v1.0 <br/> Phiên bản hiện tại
      </div>
    </div>
  );
};

export default Sidebar;
