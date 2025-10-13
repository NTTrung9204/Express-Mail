import React from "react";

const ConfirmDeleteModal = ({ open, onClose, onConfirm, username }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg w-80 p-6 text-center animate-fadeIn" onClick={(e)=>e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Xác nhận xoá
        </h2>
        <p className="text-gray-600 mb-6">
          {username
            ? `Bạn có chắc muốn xoá người dùng "${username}" không?`
            : "Bạn có chắc muốn xoá người dùng này không?"}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer"
          >
            Xoá
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition cursor-pointer"
          >
            Huỷ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
