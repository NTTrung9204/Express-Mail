import React from "react";

const ConfirmModal = ({ open, title, message, onCancel, onConfirm }) => {
  if (!open) return null;

  // Ngăn click bên trong modal làm tắt modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel?.(); // chỉ gọi khi click đúng vùng đen
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 transition-all"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-sm p-6 text-center relative animate-fadeIn">
        {/* Nút X để đóng */}
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer text-xl"
          aria-label="Close"
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold text-[#4b1d09] mb-3">
          {title || "Xác nhận hành động"}
        </h3>
        <p className="text-gray-700 mb-5">{message}</p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium cursor-pointer"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
