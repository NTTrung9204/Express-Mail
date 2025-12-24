import React from "react";

const OrderDetailModal = ({ open, onClose, order }) => {
  if (!open || !order) return null;

  const handleOverlayClick = (e) => {
    if (e.target.id === "modal-overlay") onClose();
  };

  return (
    <div
      id="modal-overlay"
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div className="bg-[#fff6f1] text-[#4b1d09] rounded-lg w-[500px] shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 hover:text-black cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-5">
          Chi tiết đơn hàng - <span className="text-orange-700">{order.id}</span>
        </h2>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <p className="font-semibold">Người gửi</p>
            <p>{order.sender}</p>
          </div>
          <div>
            <p className="font-semibold">Người nhận</p>
            <p>{order.receiver}</p>
          </div>
          <div>
            <p className="font-semibold">Số điện thoại</p>
            <p>{order.phone}</p>
          </div>
          <div>
            <p className="font-semibold">COD</p>
            <p>{order.cod}</p>
          </div>
          <div className="col-span-2">
            <p className="font-semibold text-red-600">Lý do thất bại</p>
            <p className="text-red-500">{order.reason}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
