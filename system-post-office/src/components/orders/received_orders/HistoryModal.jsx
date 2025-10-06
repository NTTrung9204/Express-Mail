import React from "react";
import { LocalShipping, Inventory2, CheckCircle } from "@mui/icons-material";

const HistoryModal = ({ open, onClose }) => {
  if (!open) return null;

  const history = [
    {
      status: "Đã nhận hàng",
      postOffice: "Bưu cục A",
      time: "2024-03-15 10:00",
      icon: <Inventory2 className="text-orange-600" fontSize="small" />,
    },
    {
      status: "Đang vận chuyển",
      postOffice: "Bưu cục B",
      time: "2024-03-15 14:30",
      icon: <LocalShipping className="text-orange-600" fontSize="small" />,
    },
    {
      status: "Đã đến kho",
      postOffice: "Bưu cục hiện tại",
      time: "2024-03-16 09:00",
      icon: <CheckCircle className="text-orange-600" fontSize="small" />,
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 transition-all"
      onClick={(e) => e.target === e.currentTarget && onClose()} 
    >
      <div className="bg-[#fff6f1] text-[#4b1d09] rounded-lg w-[500px] shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-5">
          Lịch sử vận chuyển - <span className="text-orange-700">PO123456</span>
        </h2>

        <div className="border-l border-orange-400 pl-5 space-y-6">
          {history.map((item, index) => (
            <div key={index} className="relative">
              <div className="absolute -left-[26px] bg-[#fff6f1]">
                {item.icon}
              </div>

              <div className="pb-2 border-b border-orange-200">
                <h3 className="font-semibold">{item.status}</h3>
                <p className="text-sm text-gray-600">{item.postOffice}</p>
                <p className="text-xs text-gray-500">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
