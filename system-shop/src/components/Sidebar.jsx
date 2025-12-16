import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import HistoryIcon from "@mui/icons-material/History";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import avatar from "../assets/avatar.jpg";
import { authService } from "../api/authService";
import ProtectedComponent from "../components/common/ProtectedComponent";

const Sidebar = () => {

  const API_URL = import.meta.env.VITE_API_URL;

  const location = useLocation();

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = `${API_URL}/admin/login`;
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const isOrdersActive = location.pathname.startsWith("/orders");
  const isHistoryActive = location.pathname.startsWith("/order-history");
  const isChangePasswordActive = location.pathname.startsWith("/change-password");

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
          <ProtectedComponent perm="order_external_app.can_view_shop_orders">
            <li>
                <NavLink
                  to="/orders/order-delivery"
                  className={`w-full flex items-center px-4 py-2 text-left transition font-medium cursor-pointer rounded-lg ${
                    isOrdersActive
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
          </ProtectedComponent>

          <ProtectedComponent perm="order_external_app.can_view_order_details">
            <li className="mt-2">
              <NavLink
                to="/order-history"
                className={`w-full flex items-center px-4 py-2 text-left transition font-medium cursor-pointer rounded-lg ${
                  isHistoryActive
                    ? "bg-orange-100 text-orange-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="mr-3 text-lg">
                  <HistoryIcon />
                </span>
                Lịch sử đơn hàng
              </NavLink>
            </li>
          </ProtectedComponent>

          <li className="mt-2">
              <NavLink
                to="/change-password"
                className={`w-full flex items-center px-4 py-2 text-left transition font-medium cursor-pointer rounded-lg ${
                  isChangePasswordActive
                    ? "bg-orange-100 text-orange-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="mr-3 text-lg">
                  <LockIcon />
                </span>
                Đổi mật khẩu
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
