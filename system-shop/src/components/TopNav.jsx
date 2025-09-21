import React from "react";
import NotificationsIcon from '@mui/icons-material/Notifications';

const TopNav = () => {
  return (
    <header className="flex items-center justify-between bg-white px-8 py-4 border-b border-gray-200">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <input
          type="text"
          placeholder="Tìm kiếm bằng số điện thoại, mã đơn..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>
      {/* Filter Buttons */}
      <div className="flex items-center gap-3 ml-8">
        <button className="px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition cursor-pointer">
          Light package {'<'} 20kg
        </button>
        <button className="px-4 py-2 rounded-lg bg-gray-800 text-white font-semibold hover:bg-gray-900 transition cursor-pointer">
          Heavy package {'>'} 20kg
        </button>
        <button className="ml-4 text-gray-500 hover:text-orange-500 text-2xl cursor-pointer">
          <NotificationsIcon/>
        </button>
      </div>
    </header>
  );
};

export default TopNav;
