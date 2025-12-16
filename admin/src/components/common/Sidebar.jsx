import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleIcon from "@mui/icons-material/People";
import LockIcon from "@mui/icons-material/Lock";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import { LocalShipping } from "@mui/icons-material";
import { authService } from "../../api/authService";
import ProtectedComponent from '../../components/common/ProtectedComponent'

const Sidebar = ({ setTitle }) => {
  const linkStyle =
    "flex items-center gap-2 p-3 rounded-lg hover:bg-orange-100 transition";
  const activeStyle = "bg-orange-500 text-white hover:bg-orange-500";

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login"); 
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login"); 
    }
  };

  return (
    <div className="w-64 h-screen fixed left-0 top-0 shadow-md bg-white p-5 flex flex-col justify-between">
      <div>
        <h1 className="text-xl font-bold mb-4 text-center">Admin</h1>
        <hr className="border-t border-orange-400 mb-6" />
        <nav className="flex flex-col gap-2">
          <ProtectedComponent perm="users.view_user">
            <NavLink
              to="users"
              className={({ isActive }) =>
                `${linkStyle} ${isActive ? activeStyle : ""}`
              }
              onClick={() => setTitle && setTitle("Quản lý người dùng")}
            >
              <PeopleIcon className="w-5 h-5 mr-3" />
              Quản lý Người dùng
            </NavLink>
          </ProtectedComponent>

          <ProtectedComponent perm="post_offices.view_postoffice">
            <NavLink
              to="warehouses" 
              className={({ isActive }) =>
                `${linkStyle} ${isActive ? activeStyle : ""}`
              }
              onClick={() => setTitle && setTitle("Quản lý kho")}
            >
              <WarehouseIcon className="w-5 h-5 mr-3" />
              Quản lý Kho
            </NavLink>
          </ProtectedComponent>
          <ProtectedComponent perm="shipping.view_shippingrate">  
            <NavLink
              to="shipping-rate"
              className={({ isActive }) =>
                `${linkStyle} ${isActive ? activeStyle : ""}`
              }
              onClick={() => setTitle && setTitle("Quản lý phí Ship")}
            >
              <LocalShipping className="w-5 h-5 mr-3" />
              Quản lý Phí ship
            </NavLink>
          </ProtectedComponent>

          <NavLink
            to="change-password"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeStyle : ""}`
            }
            onClick={() => setTitle && setTitle("Đổi mật khẩu")}
          >
            <LockIcon className="w-5 h-5 mr-3" />
            Đổi mật khẩu
          </NavLink>
        </nav>
      </div>

      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 hover:bg-red-50 text-red-400 rounded-md transition-colors cursor-pointer"
        >
          <LogoutIcon className="w-5 h-5 mr-3" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
