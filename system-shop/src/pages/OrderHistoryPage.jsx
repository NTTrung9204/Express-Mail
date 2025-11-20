import React, { useState } from 'react';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import NavigateNext from '@mui/icons-material/NavigateNext';
import NavigateBefore from '@mui/icons-material/NavigateBefore';

import OrderCard from '../components/order_history/OderCard';
import OrderFilterPanel from '../components/order_history/OrderFilterPanel';
import OrderDetailModal from '../components/order_history/OrderDetailModal';

import { useOrderHistoryStore } from '../stores/useOrderHistoryStore';

const OrderHistoryPage = () => {
  const {
    orders,
    loading,
    error,
    pagination,
    filters,
    applyFilters,
    clearFilters,
    nextPage,
    prevPage,
  } = useOrderHistoryStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      applyFilters({ code: searchTerm.trim() });
    } else {
      clearFilters();
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const activeFiltersCount = filters ? Object.values(filters).filter(v => v !== '').length : 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200 top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lịch sử đơn hàng</h1>
          
          <div className="flex gap-3">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <SearchOutlined className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đơn hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-orange-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"/>
            </form>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              <FilterListOutlined className="w-5 h-5" />
              <span>Lọc</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-600 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-orange-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <CancelOutlined className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Inventory2Outlined className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đơn hàng</h3>
            <p className="text-gray-500">Không tìm thấy đơn hàng nào phù hợp với bộ lọc của bạn.</p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {orders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order}
                  onClick={handleOrderClick}
                />
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-gray-600">
                  Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} của {pagination.total} đơn hàng
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevPage}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <NavigateBefore className="w-5 h-5" />
                  </button>
                  
                  <span className="px-4 py-2 text-sm font-medium text-gray-700">
                    Trang {pagination.page} / {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={nextPage}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <NavigateNext className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <OrderFilterPanel
        filters={filters || {}}
        onFilterChange={applyFilters}
        onClearFilters={clearFilters}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
};

export default OrderHistoryPage;