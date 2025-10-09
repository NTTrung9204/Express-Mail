import React, { useState } from "react";

const AssignModal = ({ open, onClose, onConfirm }) => {
  const [selectedShipper, setSelectedShipper] = useState("");

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedShipper) return;
    onConfirm?.(selectedShipper);
    onClose();
  };

  const shippers = [
    { id: 1, name: "Nguyễn Văn Shipper" },
    { id: 2, name: "Trần Thị Giao Hàng" },
    { id: 3, name: "Phạm Công Nhanh" },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#fff6f1] text-[#4b1d09] rounded-xl p-6 w-[90%] max-w-md relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold mb-5">Phân công Shipper</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="text-sm font-medium text-[#4b1d09]">
            Chọn Shipper:
          </label>

          <select
            value={selectedShipper}
            onChange={(e) => setSelectedShipper(e.target.value)}
            className="border border-orange-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">-- Chọn Shipper --</option>
            {shippers.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={!selectedShipper}
              className={`px-4 py-2 rounded-lg text-sm transition-all duration-200
                ${
                  selectedShipper
                    ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignModal;
