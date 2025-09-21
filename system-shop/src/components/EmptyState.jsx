import React from "react";

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24">
      <div className="mb-6">
        {/* Illustration/Icon */}
        <span className="text-7xl text-gray-300">📭</span>
      </div>
      <div className="text-xl font-semibold mb-2">No Data</div>
      <div className="text-gray-500 text-center max-w-md">
        No orders match your filters. Please adjust search or filter criteria.
      </div>
    </div>
  );
};

export default EmptyState;
