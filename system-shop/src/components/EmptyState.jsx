import React from "react";
import empty from '../assets/empty_result.svg'

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24">
      <img src={empty} alt="" className="w-96 h-96"/>
      <h1 className="font-bold text-blue-900 text-xl">Không tìm thấy dữ liệu</h1>
    </div>
  );
};

export default EmptyState;
