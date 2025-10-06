import React, { useState } from "react";
import { Visibility, Replay, Search } from "@mui/icons-material";
import OrderDetailModal from "../../components/orders/failed_orders/OrderDetailModal";
import ConfirmResendModal from "../../components/orders/failed_orders/ConfirmResendModal";

const FailedOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const orders = [
    {
      id: "PO123460",
      sender: "Nguyễn Văn X",
      receiver: "Trần Thị Y",
      phone: "0901234567",
      cod: "500.000 đ",
      reason: "Không liên lạc được",
      date: "2024-03-15",
    },
    {
      id: "PO123461",
      sender: "Lê Văn Z",
      receiver: "Phạm Thị W",
      phone: "0902234567",
      cod: "750.000 đ",
      reason: "Địa chỉ không chính xác",
      date: "2024-03-14",
    },
  ];

  return (
    <div className="bg-[#fff6f1] min-h-screen">
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
          <table className="w-full text-sm">
            <thead className="bg-orange-100 text-[#4b1d09] font-semibold text-left">
              <tr>
                <th className="text-left p-3">Mã đơn</th>
                <th className="text-left p-3">Người gửi</th>
                <th className="text-left p-3">Người nhận</th>
                <th className="text-left p-3">COD</th>
                <th className="text-left p-3">Lý do thất bại</th>
                <th className="text-left p-3">Ngày thất bại</th>
                <th className="text-center p-3">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-orange-100 hover:bg-orange-50 transition-all"
                >
                  <td className="p-3 font-semibold">{order.id}</td>
                  <td className="p-3">{order.sender}</td>
                  <td className="p-3">{order.receiver}</td>
                  <td className="p-3">{order.cod}</td>
                  <td className="p-3">
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {order.reason}
                    </span>
                  </td>
                  <td className="p-3">{order.date}</td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setOpenDetail(true);
                      }}
                      className="border border-orange-200 text-orange-700 hover:bg-orange-50 text-sm transition px-3 py-1 rounded-lg items-center gap-1 inline-flex cursor-pointer"
                    >
                      <Visibility fontSize="small" /> Chi tiết
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setOpenConfirm(true);
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg items-center gap-1 inline-flex cursor-pointer"
                    >
                      <Replay fontSize="small" /> Giao lại
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hai modal */}
      <OrderDetailModal open={openDetail} onClose={() => setOpenDetail(false)} order={selectedOrder}/>
      <ConfirmResendModal open={openConfirm} onClose={() => setOpenConfirm(false)} order={selectedOrder}/>
    </div>
  );
};

export default FailedOrders;
