import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LogoutIcon from "@mui/icons-material/Logout";
import avatar from "../assets/avatar.jpg";
import { authService } from "../api/authService";

const Sidebar = () => {
  const location = useLocation();

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = "http://localhost:3000/admin/login";
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const isActive = location.pathname.startsWith("/orders");

  return (
    <aside className="bg-white w-64 min-h-screen border-r border-gray-200 flex flex-col p-3 shadow-sm">
      <div className="flex items-center p-4 bg-white">
        <div className="w-16 h-16 flex-shrink-0">
          <img
            src={avatar}
            alt="User Avatar"
            className="w-full h-full rounded-full object-cover"
          />
        </div>

        <div className="ml-4 flex flex-col">
          <div className="font-semibold text-sm text-gray-900">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-gray-500 text-sm">{user.email}</div>
        </div>
      </div>

      <nav className="flex-1 mt-6">
        <ul>
          <li>
            <NavLink
              to="/orders"
              className={`w-full flex items-center px-4 py-2 text-left transition font-medium cursor-pointer rounded-lg ${
                isActive
                  ? "bg-orange-100 text-orange-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-3 text-lg">
                <Inventory2Icon />
              </span>
              Quản lý đơn hàng
            </NavLink>
          </li>

          <li className="mt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-left transition font-medium cursor-pointer text-gray-700 hover:bg-red-100 hover:text-red-600 rounded-lg"
            >
              <span className="mr-3 text-lg">
                <LogoutIcon />
              </span>
              Đăng xuất
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
