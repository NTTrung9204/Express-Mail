import React from "react";


const FilterBar = () => {
  return (
    <div className="flex items-center bg-white px-8 py-3 border-b border-gray-200 gap-2">
      <span className="text-gray-600 font-medium">Từ:</span>
      <input
        type="date"
        className="w-36 h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 cursor-pointer"
        placeholder="mm/dd/yyyy"
      />
      <span className="text-gray-600 font-medium ml-2">Đến:</span>
      <input
        type="date"
        className="w-36 h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 cursor-pointer"
        placeholder="mm/dd/yyyy"
      />
      <button className="ml-3 h-10 px-6 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-orange-50 hover:border-orange-400 transition cursor-pointer">
        Lọc
      </button>
    </div>
  );
};

export default FilterBar;
