import React from "react";
import { ORDER_TABS } from "../constants/orderTabs";

const Tabs = ({ activeTab, counts = [], onTabChange }) => {
  return (
    <div className="flex bg-white border-b border-gray-200 overflow-x-auto">
      {ORDER_TABS.map((tab, idx) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(idx)}
          className={`px-4 py-2 font-medium flex items-center gap-2 transition border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === idx
              ? "border-orange-500 text-orange-600 bg-orange-50"
              : "border-transparent text-gray-600 hover:bg-gray-100"
          }`}
        >
          {tab.name}
          <span className="ml-1 bg-gray-200 text-xs px-2 py-0.5 rounded font-semibold">
            {counts[idx] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;