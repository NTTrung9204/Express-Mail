import React from "react";

const Header = () => {
  return (
    <div className="bg-white shadow p-4 flex justify-between items-center">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
        Đăng xuất
      </button>
    </div>
  );
};

export default Header;
