import React from "react";
import { Outlet } from "react-router-dom";
import TopNavOrders from "../../components/orders/TopNavOrders";

const Orders = () => {
  return (
    <div className="bg-[#fff8f5] min-h-screen text-[#4b1d09]">
      <h1 className="text-3xl font-bold text-[#4b1d09]">Quản lý Đơn hàng</h1>
      <p className="text-base text-gray-600 mb-6">
        Theo dõi và xử lý đơn hàng
      </p>

      <TopNavOrders />

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
};

export default Orders;
