import React from "react";
import DashboardCard from "../components/DashboardCard";
import { People, Warehouse, TrendingUp, ShowChart } from "@mui/icons-material";

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-orange-50 p-6 rounded-xl">
        <h1 className="text-2xl font-bold mb-2">
          Chào mừng đến với Admin Dashboard
        </h1>
        <p>Quản lý người dùng và kho hàng một cách dễ dàng và hiệu quả</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardCard title="Tổng số Người dùng" value="1,234" percent="12" icon={<People/>}/>
        <DashboardCard title="Kho đang hoạt động" value="56" percent="3" icon={<Warehouse/>}/>
        <DashboardCard title="Hoạt động hôm nay" value="2,345" percent="8" icon={<ShowChart/>}/>
        <DashboardCard title="Tăng trưởng" value="15.3%" percent="2.1" icon={<TrendingUp/>}/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2 text-orange-600">
            <People />
            <h2 className="text-lg font-semibold">Quản lý Người dùng</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Thêm, sửa, xóa và quản lý thông tin người dùng trong hệ thống
          </p>
          <div className="flex gap-6 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              1,156 hoạt động
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              78 ngừng hoạt động
            </span>
          </div>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2 text-orange-600">
            <Warehouse />
            <h2 className="text-lg font-semibold">Quản lý Kho</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Quản lý thông tin các kho hàng, địa chỉ và trạng thái hoạt động
          </p>
          <div className="flex gap-6 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              52 kho hoạt động
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              4 kho tạm dừng
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
