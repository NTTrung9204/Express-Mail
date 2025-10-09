import React from "react";

const DashboardCard = ({ title, value, percent, icon }) => {
  return (
    <div className="bg-white shadow rounded-xl p-6 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-gray-600">
        {icon}
        <span className="font-medium">{title}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-orange-500 text-sm">+{percent}% so với tháng trước</div>
    </div>
  );
};

export default DashboardCard;
