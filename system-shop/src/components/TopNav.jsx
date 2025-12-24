import React from "react";
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Link } from 'react-router-dom';

const TopNav = () => {
  return (
    <header className="flex items-center justify-between bg-white px-8 py-4 border-b border-gray-200">
      <div className="flex items-center gap-3 ml-auto">
        <Link
          to="/orders/create-order"
          className="px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition cursor-pointer"
        >
          Tạo đơn hàng
        </Link>
      </div>
    </header>
  );
};

export default TopNav;
