import React from "react";

const tabs = [
  "Đơn nháp",
  "Chờ bàn giao",
  "Đã bàn giao - Đang giao",
  "Đã bàn giao - Đang hoàn hàng",
  "Chờ xác nhận",
  "Hoàn tất",
  "Đơn huỷ",
  "Hàng thất lạc/Hư hỏng",
];

const Tabs = ({ active = 0, counts = Array(tabs.length).fill(0), onTabChange }) => {
  return (
    <div className="flex bg-white border-b border-gray-200">
      {tabs.map((tab, idx) => (
        <button
          key={tab}
          onClick={() => onTabChange && onTabChange(idx)}
          className={`px-4 py-2 font-medium flex items-center gap-2 transition border-b-2 cursor-pointer ${
            active === idx
              ? "border-orange-500 text-orange-600 bg-orange-50"
              : "border-transparent text-gray-600 hover:bg-gray-100"
          }`}
        >
          {tab}
          <span className="ml-1 bg-gray-200 text-xs px-2 py-0.5 font-semibold">
            {counts[idx] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;
