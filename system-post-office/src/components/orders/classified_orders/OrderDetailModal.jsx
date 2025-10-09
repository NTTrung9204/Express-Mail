import React from "react";
import { Close } from "@mui/icons-material";

const OrderDetailModal = ({ open, onClose, order }) => {
  if (!open || !order) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#fff6f1] text-[#4b1d09] rounded-xl shadow-xl p-6 w-[90%] max-w-lg relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black cursor-pointer"
        >
          <Close fontSize="small" />
        </button>

        <h3 className="text-lg font-semibold mb-4">
          Chi tiết đơn hàng - <span className="text-orange-700">{order.code}</span>
        </h3>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <p className="font-medium">Người gửi</p>
            <p>{order.sender}</p>
          </div>
          <div>
            <p className="font-medium">Người nhận</p>
            <p>{order.receiver}</p>
          </div>

          <div>
            <p className="font-medium">Tỉnh/Thành nhận</p>
            <p>{order.province}</p>
          </div>
          <div>
            <p className="font-medium">Trạng thái</p>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-xs ${
                order.status === "Đã phân loại"
                  ? "bg-orange-500 text-white"
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              {order.status}
            </span>
          </div>

          <div>
            <p className="font-medium">Ngày phân loại</p>
            <p>{order.date}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
