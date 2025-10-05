import React from "react";
import { Dashboard, People, Warehouse } from "@mui/icons-material";
import { NavLink } from "react-router-dom";

const Sidebar = ({setTitle}) => {
  const linkStyle =
    "flex items-center gap-2 p-3 rounded-lg hover:bg-orange-100 transition";
  const activeStyle = "bg-orange-500 text-white hover:bg-orange-500";

  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-white p-4 flex flex-col justify-between shadow-md z-50">
      <div>
        <h1 className="text-xl font-bold mb-8">Admin Panel</h1>
        <nav className="flex flex-col gap-2">
          <NavLink
            to="/home"
            end
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeStyle : ""}`
            }
            onClick={()=>setTitle("Dashboard")}
          >
            <Dashboard /> Dashboard
          </NavLink>
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeStyle : ""}`
            }
            onClick={()=>setTitle("Quản lý người dùng")}
          >
            <People /> Quản lý Người dùng
          </NavLink>
          <NavLink
            to="/warehouses"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeStyle : ""}`
            }
            onClick={()=>setTitle("Quản lý kho")}
          >
            <Warehouse /> Quản lý Kho
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
