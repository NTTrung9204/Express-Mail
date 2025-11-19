import React, { useState } from 'react';
import Close from '@mui/icons-material/Close';
import ExpandMore from '@mui/icons-material/ExpandMore';

const OrderFilterPanel = ({ filters, onFilterChange, onClearFilters, isOpen, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleClear = () => {
    const emptyFilters = {
      code: '',
      shopId: '',
      order_status: '',
      shipping_status: ''
    };
    setLocalFilters(emptyFilters);
    onClearFilters();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <Close className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Mã đơn hàng</label>
            <input
              type="text"
              placeholder="Nhập mã đơn hàng"
              value={localFilters.code}
              onChange={(e) => setLocalFilters({ ...localFilters, code: e.target.value })}
              className="w-full border border-orange-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Trạng thái vận chuyển</label>
            <div className="relative">
              <select
                value={localFilters.shipping_status}
                onChange={(e) => setLocalFilters({ ...localFilters, shipping_status: e.target.value })}
                className="w-full bg-gray-50 border border-orange-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none p-2.5 appearance-none pr-10"
              >
                <option value="">Tất cả</option>
                <option value="PICKUP_REQUESTED">Yêu cầu lấy hàng</option>
                <option value="IN_TRANSIT">Đang vận chuyển</option>
                <option value="CLASSIFIED">Đã phân loại</option>
                <option value="IN_WAREHOUSE">Tại kho</option>
                <option value="SHIPPING">Đang giao hàng</option>
                <option value="PICKUP_FAILED">Lấy hàng thất bại</option>
                <option value="DELIVERY_FAILED">Giao hàng thất bại</option>
                <option value="RETURNING">Đang hoàn hàng</option>
                <option value="FINISHED">Hoàn tất</option>
              </select>
              <ExpandMore className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Trạng thái đơn hàng</label>
            <div className="relative">
              <select
                value={localFilters.order_status}
                onChange={(e) => setLocalFilters({ ...localFilters, order_status: e.target.value })}
                className="w-full bg-gray-50 border border-orange-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 p-2.5 outline-none appearance-none pr-10"
              >
                <option value="">Tất cả</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="CANCELED">Đã hủy</option>
                <option value="COMPLETED">Hoàn thành</option>
              </select>
              <ExpandMore className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={handleClear}
            className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Xóa bộ lọc
          </button>
          <button
            onClick={handleApply}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderFilterPanel;