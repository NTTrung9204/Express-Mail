import React from "react";

const ConfirmResendModal = ({ open, onClose, order }) => {
  if (!open || !order) return null;

  const handleOverlayClick = (e) => {
    if (e.target.id === "confirm-overlay") onClose();
  };

  const handleConfirm = () => {
    alert(`Đã xác nhận giao lại đơn ${order.id}`);
    onClose();
  };

  return (
    <div
      id="confirm-overlay"
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg w-[400px] shadow-lg p-6 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 hover:text-black cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold text-[#4b1d09] mb-4">
          Xác nhận giao lại
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Bạn có chắc muốn giao lại đơn{" "}
          <span className="font-semibold text-orange-600">{order.id}</span>?
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmResendModal;
