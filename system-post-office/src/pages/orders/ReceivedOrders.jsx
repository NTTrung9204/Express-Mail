import React, { useState } from "react";
import { Visibility, AssignmentInd, Search } from "@mui/icons-material";
import HistoryModal from "../../components/orders/received_orders/HistoryModal";
import AssignModal from "../../components/orders/received_orders/AssignModal";

const ReceivedOrders = () => {
  const [openHistory, setOpenHistory] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);

  const orders = [
    {
      code: "PO123456",
      sender: "Nguyễn Văn A",
      receiver: "Trần Thị B",
      phone: "0901234567",
      cod: "500.000 đ",
      fee: "50.000 đ",
      status: "Trong kho",
    },
    {
      code: "PO123457",
      sender: "Lê Văn C",
      receiver: "Phạm Thị D",
      phone: "0902234567",
      cod: "750.000 đ",
      fee: "60.000 đ",
      status: "Đang vận chuyển",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-5">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn, tên người gửi, người nhận..."
            className="w-full border border-orange-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-orange-100 text-[#4b1d09] font-semibold text-left">
            <th className="px-4 py-3 border-b border-orange-200">Mã đơn</th>
            <th className="px-4 py-3 border-b border-orange-200">Người gửi</th>
            <th className="px-4 py-3 border-b border-orange-200">Người nhận</th>
            <th className="px-4 py-3 border-b border-orange-200">COD</th>
            <th className="px-4 py-3 border-b border-orange-200">Phí vận chuyển</th>
            <th className="px-4 py-3 border-b border-orange-200">Trạng thái</th>
            <th className="px-4 py-3 border-b border-orange-200 text-center">
              Hành động
            </th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order, i) => (
            <tr
              key={i}
              className={`hover:bg-orange-50 transition ${
                i !== orders.length - 1 ? "border-b border-orange-100" : ""
              }`}
            >
              <td className="px-4 py-3">{order.code}</td>
              <td className="px-4 py-3">{order.sender}</td>
              <td className="px-4 py-3">
                {order.receiver}
                <div className="text-xs text-gray-500">{order.phone}</div>
              </td>
              <td className="px-4 py-3">{order.cod}</td>
              <td className="px-4 py-3">{order.fee}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === "Trong kho"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {order.status}
                </span>
              </td>

              <td className="px-4 py-3 text-center">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setOpenHistory(true)}
                    className="flex items-center gap-1 px-3 py-1 border border-orange-200 rounded-lg text-orange-700 hover:bg-orange-50 text-sm transition cursor-pointer"
                    title="Xem lịch sử"
                  >
                    <Visibility fontSize="small" />
                    <span>Lịch sử</span>
                  </button>

                  <button
                    onClick={() => setOpenAssign(true)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm transition cursor-pointer"
                    title="Phân công"
                  >
                    <AssignmentInd fontSize="small" />
                    <span>Phân công</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <HistoryModal open={openHistory} onClose={() => setOpenHistory(false)} />
      <AssignModal open={openAssign} onClose={() => setOpenAssign(false)} />
    </div>
  );
};

export default ReceivedOrders;
