import React from "react";
import { NavLink } from "react-router-dom";

const tabs = [
  { name: "Đơn đã nhận", path: "received" },
  { name: "Đơn giao thất bại", path: "failed" },
  { name: "Đơn yêu cầu", path: "request" },
  { name: "Đơn đã phân loại", path: "classified" },
];

const TopNavOrders = () => {
  return (
    <div className="flex gap-6 border-b border-gray-200">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `pb-2 font-medium text-sm ${
              isActive
                ? "text-orange-600 border-b-2 border-orange-500"
                : "text-gray-500 hover:text-orange-600"
            }`
          }
        >
          {tab.name}
        </NavLink>
      ))}
    </div>
  );
};

export default TopNavOrders;
