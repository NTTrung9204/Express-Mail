import React from "react";
import {
  Inventory2,
  ErrorOutline,
  LocalShipping,
  People,
} from "@mui/icons-material";
import DashboardCard from "../components/dashboard/DashboardCard";

const Dashboard = () => {
  const orders = [
    { id: "PO123456", sender: "Nguyễn Văn A", receiver: "Trần Thị B", status: "Đang vận chuyển", color: "text-orange-500" },
    { id: "PO123457", sender: "Lê Văn C", receiver: "Phạm Thị D", status: "Hoàn thành", color: "text-green-600" },
    { id: "PO123458", sender: "Hoàng Văn E", receiver: "Vũ Thị F", status: "Chờ xử lý", color: "text-yellow-500" },
    { id: "PO123459", sender: "Đặng Văn G", receiver: "Bùi Thị H", status: "Thất bại", color: "text-red-600" },
  ];

  return (
    <div className="flex-1 bg-orange-50 p-5 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-500 text-base mb-10">Tổng quan hoạt động bưu cục</p>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-8 mb-10">
        <DashboardCard
          title="Tổng đơn hàng"
          value="1,234"
          changeText="+12.5% so với tháng trước"
          icon={<Inventory2 fontSize="medium" />}
        />
        <DashboardCard
          title="Đơn giao thất bại"
          value="45"
          changeText="-8.3% so với tháng trước"
          icon={<ErrorOutline fontSize="medium" />}
          color="text-red-600"
        />
        <DashboardCard
          title="Yêu cầu chờ xử lý"
          value="23"
          changeText="+5.2% so với tháng trước"
          icon={<LocalShipping fontSize="medium" />}
          color="text-red-600"
        />
        <DashboardCard
          title="Shipper hoạt động"
          value="67"
          changeText="+15.7% so với tháng trước"
          icon={<People fontSize="medium" />}
        />
        <DashboardCard
          title="Nhân viên hoạt động"
          value="50"
          changeText="Ổn định"
          icon={<People fontSize="medium" />}
        />
      </div>

      {/* Orders and performance */}
      <div className="grid grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white p-10 rounded-3xl shadow-md">
          <h2 className="font-bold text-xl mb-5">Đơn hàng gần đây</h2>
          <ul className="space-y-4">
            {orders.map((o) => (
              <li key={o.id} className="flex justify-between border-b pb-3">
                <div>
                  <p className="font-semibold text-base">{o.id}</p>
                  <p className="text-gray-500 text-sm">
                    {o.sender} → {o.receiver}
                  </p>
                </div>
                <p className={`text-sm font-semibold ${o.color}`}>{o.status}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Performance */}
        <div className="bg-white p-10 rounded-3xl shadow-md">
          <h2 className="font-bold text-xl mb-5">Hiệu suất vận chuyển</h2>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <p>Đã hoàn thành</p>
                <p className="text-gray-600">85%</p>
              </div>
              <div className="w-full bg-orange-100 h-3 rounded-full">
                <div className="bg-green-500 h-3 rounded-full w-[85%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <p>Đang vận chuyển</p>
                <p className="text-gray-600">12%</p>
              </div>
              <div className="w-full bg-orange-100 h-3 rounded-full">
                <div className="bg-orange-400 h-3 rounded-full w-[12%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <p>Thất bại</p>
                <p className="text-gray-600">3%</p>
              </div>
              <div className="w-full bg-orange-100 h-3 rounded-full">
                <div className="bg-red-500 h-3 rounded-full w-[3%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
