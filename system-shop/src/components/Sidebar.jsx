import React from "react";
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import DownloadIcon from '@mui/icons-material/Download';
import StoreIcon from '@mui/icons-material/Store';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SettingsIcon from '@mui/icons-material/Settings';

const menuItems = [
  { label: "Trang chủ", icon: <DashboardIcon /> },
  { label: "Quản lý đơn hàng", icon: <Inventory2Icon /> },
  { label: "Nhập từ Excel", icon: <DownloadIcon /> },
  { label: "Quản lý kho", icon: <StoreIcon /> },
  { label: "COD", icon: <AttachMoneyIcon /> },
  { label: "Khiếu nại", icon: <NoteAltIcon /> },
  { label: "Quyền hạn", icon: <VpnKeyIcon /> },
  { label: "Cài đặt", icon: <SettingsIcon /> },
];

const Sidebar = ({ active = "Quản lý đơn hàng" }) => {
  return (
    <aside className="bg-white w-64 min-h-screen border-r border-gray-200 flex flex-col p-3">
      <div className="flex flex-col items-center p-4 border border-gray-400 rounded-sm">
        <div className="flex justify-center items-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl">
                <span role="img" aria-label="avatar">👤</span>
            </div>
            <div className="ml-2 flex flex-col">
                <div className="font-semibold text-sm">Cường Bùi</div>
                <div className="text-gray-500 text-sm">+84 123 456 789</div>
            </div>
        </div>
        <div className="flex items-center flex-col mt-2">
            <div className="flex justify-between gap-4">
                <label htmlFor="" className="text-gray-600 font-bold">Số dư: </label>
                <span className="font-bold text-orange-500 mr-2">₫1,000,000</span>
            </div>
          <button className="bg-gray-200 w-full mt-2 p-2 rounded-sm hover:bg-orange-400 hover:text-white transition cursor-pointer">Xác thực tài khoản</button>
        </div>
      </div>
      <nav className="flex-1 mt-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                className={`w-full flex items-center px-4 py-2 text-left transition font-medium cursor-pointer ${
                  active === item.label
                    ? "bg-orange-100 text-orange-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
