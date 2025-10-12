import React from "react";
import { NavLink } from "react-router-dom";

const tabs = [
  { name: "Đơn nháp", path: "/order-draft" },
  { name: "Chờ bàn giao", path: "/waiting-delivery" },
  { name: "Đã bàn giao - Đang giao", path: "/order-delivery" },
  { name: "Đã bàn giao - Đang hoàn hàng", path: "/returning" },
  { name: "Chờ xác nhận", path: "/waiting-confirm" },
  { name: "Hoàn tất", path: "/completed" },
  { name: "Đơn huỷ", path: "/cancelled" },
  { name: "Hàng thất lạc/Hư hỏng", path: "/lost-damaged" },
];

const Tabs = ({ counts = Array(tabs.length).fill(0) }) => {
  return (
    <div className="flex bg-white border-b border-gray-200">
      {tabs.map((tab, idx) => (
        <NavLink
          key={tab.name}
          to={tab.path}
          className={({ isActive }) =>
            `px-4 py-2 font-medium flex items-center gap-2 transition border-b-2 cursor-pointer ${
              isActive
                ? "border-orange-500 text-orange-600 bg-orange-50"
                : "border-transparent text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          {tab.name}
          <span className="ml-1 bg-gray-200 text-xs px-2 py-0.5 font-semibold">
            {counts[idx] ?? 0}
          </span>
        </NavLink>
      ))}
    </div>
  );
};

export default Tabs;
