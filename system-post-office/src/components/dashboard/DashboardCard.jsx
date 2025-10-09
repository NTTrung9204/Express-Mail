import React from "react";

const DashboardCard = ({ title, value, icon, changeText, color = "text-green-600" }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md flex justify-between items-center min-h-[140px]">
      <div>
        <p className="text-gray-500 text-sm mb-1">{title}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
        <p className={`${color} text-sm mt-2`}>{changeText}</p>
      </div>
      <div className="bg-orange-100 text-orange-500 px-3 py-2 rounded-xl text-2xl">
        {icon}
      </div>
    </div>
  );
};

export default DashboardCard;
