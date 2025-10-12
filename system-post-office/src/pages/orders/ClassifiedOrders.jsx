import React, { useState } from "react";
import { Search, Visibility } from "@mui/icons-material";
import OrderDetailModal from "../../components/orders/classified_orders/OrderDetailModal";

const ClassifiedOrders = () => {
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orders = [
    {
      code: "PO123470",
      sender: "Nguyễn Văn Q",
      receiver: "Trần Thị R",
      province: "Hà Nội",
      status: "Đã phân loại",
      date: "2024-03-15",
    },
    {
      code: "PO123471",
      sender: "Lê Văn S",
      receiver: "Phạm Thị T",
      province: "TP. Hồ Chí Minh",
      status: "Trong kho",
      date: "2024-03-14",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn, tên người gửi, người nhận..."
            className="w-full border border-orange-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>

      <div className="overflow-hidden rounded-lg border border-orange-100">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-orange-100 text-[#4b1d09] font-semibold text-left">
            <tr>
              <th className="p-3">Mã đơn</th>
              <th className="p-3">Người gửi</th>
              <th className="p-3">Người nhận</th>
              <th className="p-3">Tỉnh/Thành nhận</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Ngày phân loại</th>
              <th className="p-3 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order, i) => (
              <tr
                key={i}
                className="border-b border-gray-100 hover:bg-orange-50 transition"
              >
                <td className="p-3 font-semibold">{order.code}</td>
                <td className="p-3">{order.sender}</td>
                <td className="p-3">{order.receiver}</td>
                <td className="p-3">{order.province}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      order.status === "Đã phân loại"
                        ? "bg-orange-500 text-white"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-3 text-gray-700">{order.date}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setOpenDetail(true);
                    }}
                    className="border border-orange-200 text-orange-700 hover:bg-orange-50 text-sm transition px-3 py-1 rounded-lg items-center gap-1 inline-flex cursor-pointer"
                  >
                    <Visibility fontSize="small" /> Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openDetail && (
        <OrderDetailModal open={openDetail} onClose={() => setOpenDetail(false)} order={selectedOrder}/>
      )}
    </div>
  );
};

export default ClassifiedOrders;
