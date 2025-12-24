import React, { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LocalShipping, Inventory2, People, RouteOutlined } from "@mui/icons-material";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from '@mui/icons-material/Logout';
import { toast } from "react-toastify";
import authAPI from "../../api/authAPI";
import ProtectedComponent from "./ProtectedComponent";
import AvatarGenerator from "./AvatarGenerator";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const sidebarRoutes = [
    { path: "/post-office/shippers", perm: "post_offices.view_user" },
    { path: "/post-office/staffs", perm: "post_offices.view_user" },
    { path: "/post-office/orders", perm: "order_external_app.can_view_all_orders" },
    { path: "/post-office/delivery-plans", perm: "plan_external_app.can_view_shipping_plan" },
    { path: "/post-office/change-password", perm: null } 
  ];

  const hasPermission = (perm) => {
    if (!perm) return true;
    const permissions = ["post_offices.view_user","post_offices.view_user","order_external_app.can_view_all_orders","plan_external_app.can_view_shipping_plan"];
    return permissions.includes(perm);
  };

  const findFirstAccessibleRoute = () => {
    for (const route of sidebarRoutes) {
      if (hasPermission(route.perm)) {
        return route.path;
      }
    }
    return "/post-office/change-password"; 
  };

  useEffect(() => {
    const currentPath = location.pathname;
    
    const currentRoute = sidebarRoutes.find(route => 
      currentPath.startsWith(route.path)
    );

    if (currentRoute && currentRoute.perm && !hasPermission(currentRoute.perm)) {
      const firstAccessibleRoute = findFirstAccessibleRoute();
      navigate(firstAccessibleRoute, { replace: true });
    }
  }, [location.pathname]);

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
    <div className="w-64 bg-[#4b1d09] text-white min-h-screen p-5 flex flex-col">
      <div className="flex items-center p-3 mb-4 bg-[#5a2410] rounded-lg">
        <div className="w-12 h-12 flex-shrink-0">
          <AvatarGenerator
            firstName={user.firstName}
            lastName={user.lastName}
            size={48}
          />
        </div>
        <div className="ml-3 flex flex-col min-w-0 flex-1">
          <div className="font-semibold text-sm text-white truncate" title={`${user.firstName} ${user.lastName}`}>
            {user.firstName} {user.lastName}
          </div>
          <div className="text-orange-200 text-xs truncate" title={user.email}>
            {user.email}
          </div>
        </div>
      </div>

      <hr className="border-t border-orange-400 mb-6" />

      <ul className="space-y-3 font-semibold flex-1">
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
        
        <ProtectedComponent perm="plan_external_app.can_view_shipping_plan">
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
        </ProtectedComponent>
        
        <li>
          <NavLink
            to="/post-office/change-password"
            className={({ isActive }) =>
              `${linkClasses} ${isActive ? activeClasses : ""}`
            }
          >
            <LockIcon className="mr-3 text-base" /> Đổi mật khẩu
          </NavLink>
        </li>
      </ul>

      <div className="border-t border-orange-400 pt-4 mt-4">
        <button
          onClick={handleLogout}
          className={`${linkClasses} w-full text-left hover:bg-red-600`}
        >
          <LogoutIcon className="mr-3 text-base" /> Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Sidebar;