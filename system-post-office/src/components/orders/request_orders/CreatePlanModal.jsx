import React, { useState } from "react";
import { Close } from "@mui/icons-material";

const CreatePlanModal = ({ open, onClose, selectedOrders, onCreatePlan, loading }) => {
  const [vehicles, setVehicles] = useState(1);

  if (!open) return null;

  const handleCreatePlan = () => {
    if (!vehicles || vehicles < 1) {
      alert("Vui lòng nhập số xe >= 1");
      return;
    }
    onCreatePlan(vehicles);
  };

  return (
    <div
      id="plan-overlay"
      onClick={(e) => e.target.id === "plan-overlay" && !loading && onClose()}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-xl w-[600px] shadow-lg p-6 relative max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-600 hover:text-black cursor-pointer disabled:opacity-50"
        >
          <Close />
        </button>

        <h2 className="text-xl font-bold text-[#4b1d09] mb-4">Tạo kết hoạch giao hàng</h2>

        {/* Selected Orders List */}
        <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h3 className="font-semibold text-[#4b1d09] mb-3">
            Đơn hàng được chọn ({selectedOrders.length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-2 bg-white rounded border border-orange-100">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#4b1d09]">{order.code}</p>
                  <p className="text-xs text-gray-600">{order.shopProfile?.username || "N/A"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-orange-600">
                    {(order.cod || 0).toLocaleString('vi-VN')} đ
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#4b1d09] mb-2">
            Số xe giao hàng (Shipper)
          </label>
          <input
            type="number"
            min="1"
            value={vehicles}
            onChange={(e) => setVehicles(parseInt(e.target.value) || 1)}
            disabled={loading}
            className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 disabled:bg-gray-100"
            placeholder="Nhập số xe..."
          />
          <p className="text-xs text-gray-600 mt-1">Số xe sẽ được sử dụng để tối ưu hóa tuyến đường giao hàng</p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={handleCreatePlan}
            disabled={loading || vehicles < 1}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Đang tạo...
              </>
            ) : (
              "Tạo kết hoạch"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePlanModal;
