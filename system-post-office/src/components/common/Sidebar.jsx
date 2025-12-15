import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LocalShipping, Inventory2, People, RouteOutlined } from "@mui/icons-material";
import LogoutIcon from '@mui/icons-material/Logout';
import { toast } from "react-toastify";
import authAPI from "../../api/authAPI";
import ProtectedComponent from "./ProtectedComponent";


const Sidebar = () => {
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL;


  const handleLogout = async () => {
    try {
      await authAPI.logout();
      toast.success("Đã đăng xuất");
      window.location.href = `${API_URL}/admin/login`;
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Lỗi khi đăng xuất");
    }
  };

  const linkClasses =
    "flex items-center p-4 rounded-lg transition-all duration-200 hover:bg-orange-400 text-sm";
  const activeClasses = "bg-orange-500";

  return (
    <div className="w-64 bg-[#4b1d09] text-white min-h-screen p-5">
      <h1 className="text-2xl font-bold mb-3 text-center">Bưu Cục</h1>
      <hr className="border-t border-orange-400 mb-6" />

      <ul className="space-y-3 font-semibold">
        <ProtectedComponent perm="post_offices.view_user">
          <li>
            <NavLink
              to="/post-office/shippers"
              className={({ isActive }) =>
                `${linkClasses} ${isActive ? activeClasses : ""}`
              }
            >
              <LocalShipping className="mr-3 text-base" /> Quản lý Shipper
            </NavLink>
          </li>
        </ProtectedComponent>
        <ProtectedComponent perm="order_external_app.can_view_all_orders">
          <li>
            <NavLink
              to="/post-office/orders/received"
              className={() =>
                `${linkClasses} ${
                  location.pathname.startsWith("/post-office/orders")
                    ? activeClasses
                    : ""
                }`
              }
            >
              <Inventory2 className="mr-3 text-base" /> Quản lý Đơn hàng
            </NavLink>
          </li>
        </ProtectedComponent>
        <li>
          <NavLink
            to="/post-office/delivery-plans"
            className={({ isActive }) =>
              `${linkClasses} ${isActive ? activeClasses : ""}`
            }
          >
            <RouteOutlined className="mr-3 text-base" /> Kế hoạch giao hàng
          </NavLink>
        </li>
        <ProtectedComponent perm="post_offices.view_user">
          <li>
            <NavLink
              to="/post-office/staffs"
              className={({ isActive }) =>
                `${linkClasses} ${isActive ? activeClasses : ""}`
              }
            >
              <People className="mr-3 text-base" /> Quản lý Nhân viên
            </NavLink>
          </li>
        </ProtectedComponent>
        <li>
          <button
            onClick={handleLogout}
            className={`${linkClasses} w-full text-left`}
          >
            <LogoutIcon className="mr-3 text-base" /> Đăng xuất
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
