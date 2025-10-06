import React, { useState } from "react";
import { Visibility, CheckCircle, PersonAdd, Search } from "@mui/icons-material";
import OrderHistoryModal from "../../components/orders/request_orders/OrderHistoryModal";
import ConfirmArrivedModal from "../../components/orders/request_orders/ConfirmArriveModal";
import AssignModal from "../../components/orders/request_orders/AssignModal";

const RequestOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openHistory, setOpenHistory] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);

  const orders = [
    {
      id: "PO123465",
      post: "Bưu cục A",
      sender: "Nguyễn Văn M",
      receiver: "Trần Thị N",
      phone: "0901234567",
      cod: "600.000 đ",
      status: "Chờ xử lý",
    },
    {
      id: "PO123466",
      post: "Bưu cục B",
      sender: "Lê Văn O",
      receiver: "Phạm Thị P",
      phone: "0902234567",
      cod: "850.000 đ",
      status: "Đang chuyển",
    },
  ];

  return (
    <div className="bg-[#fff6f1] min-h-screen">
      <div className="bg-white rounded-xl shadow p-5">
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
            <thead className="bg-orange-50 text-[#4b1d09]">
              <tr>
                <th className="text-left p-3">Mã đơn</th>
                <th className="text-left p-3">Từ bưu cục</th>
                <th className="text-left p-3">Người gửi</th>
                <th className="text-left p-3">Người nhận</th>
                <th className="text-left p-3">COD</th>
                <th className="text-left p-3">Trạng thái</th>
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
                  <td className="p-3">{order.post}</td>
                  <td className="p-3">{order.sender}</td>
                  <td className="p-3">
                    {order.receiver}
                    <br />
                    <span className="text-xs text-gray-500">{order.phone}</span>
                  </td>
                  <td className="p-3">{order.cod}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "Đang chuyển"
                          ? "bg-orange-500 text-white"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setOpenHistory(true);
                      }}
                      className="border border-orange-200 text-orange-700 hover:bg-orange-50 text-sm transition px-3 py-1 rounded-lg items-center gap-1 inline-flex cursor-pointer"
                    >
                      <Visibility fontSize="small" /> Lịch sử
                    </button>

                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setOpenConfirm(true);
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg items-center gap-1 inline-flex cursor-pointer"
                    >
                      <CheckCircle fontSize="small" /> Xác nhận đã đến
                    </button>

                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setOpenAssign(true);
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg items-center gap-1 inline-flex cursor-pointer"
                    >
                      <PersonAdd fontSize="small" /> Phân công
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <OrderHistoryModal open={openHistory} onClose={() => setOpenHistory(false)} order={selectedOrder}/>
      <ConfirmArrivedModal open={openConfirm} onClose={() => setOpenConfirm(false)} order={selectedOrder}/>
      <AssignModal open={openAssign} onClose={() => setOpenAssign(false)} order={selectedOrder}/>
    </div>
  );
};

export default RequestOrders;
