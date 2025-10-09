import React from "react";
import {
  Inventory2,
  LocalShipping,
  Home,
} from "@mui/icons-material";

const OrderHistoryModal = ({ open, onClose, order }) => {
  if (!open || !order) return null;

  const history = [
    {
      id: 1,
      status: "Đã tạo đơn",
      description: `Tạo tại ${order.post}`,
      icon: <Inventory2 fontSize="small" className="text-orange-600" />,
    },
    {
      id: 2,
      status: "Đang vận chuyển",
      description: "Đang được vận chuyển giữa các bưu cục",
      icon: <LocalShipping fontSize="small" className="text-orange-600" />,
    },
    {
      id: 3,
      status: "Đang giao đến người nhận",
      description: `Người nhận: ${order.receiver}`,
      icon: <Home fontSize="small" className="text-orange-600" />,
    },
  ];

  return (
    <div
      id="history-overlay"
      onClick={(e) => e.target.id === "history-overlay" && onClose()}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 transition-all"
    >
      <div className="bg-[#fff6f1] rounded-lg w-[480px] shadow-lg p-6 relative border border-orange-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 hover:text-black text-lg cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold text-[#4b1d09] mb-4">
          Lịch sử vận chuyển -{" "}
          <span className="text-orange-700 font-medium">{order.id}</span>
        </h2>

        <div className="border-l-2 border-orange-400 pl-4 space-y-5">
          {history.map((item) => (
            <div key={item.id} className="relative">
              <div className="absolute -left-[28px] bg-[#fff6f1]">
                {item.icon}
              </div>

              <div className="pb-1">
                <h3 className="font-semibold text-[#4b1d09]">
                  {item.status}
                </h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryModal;
