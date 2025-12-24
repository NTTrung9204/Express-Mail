import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, limit, total, onPageChange, onLimitChange }) => {
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return (
    <div className="mt-6 bg-gradient-to-br from-orange-50 to-white rounded-xl shadow-lg border border-orange-100 p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Items per page selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700 font-semibold">Hiển thị</span>
          <div className="relative">
            <select
              value={limit}
              onChange={(e) => {
                onLimitChange(parseInt(e.target.value));
                onPageChange(1);
              }}
              className="border-2 border-orange-200 rounded-lg pl-4 pr-10 py-2 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all cursor-pointer hover:border-orange-300 appearance-none min-w-[80px]"
              style={{
                backgroundImage: 'none'
              }}
            >
              <option value={5} className="py-2 px-4 hover:bg-orange-50">5</option>
              <option value={10} className="py-2 px-4 hover:bg-orange-50">10</option>
              <option value={20} className="py-2 px-4 hover:bg-orange-50">20</option>
              <option value={50} className="py-2 px-4 hover:bg-orange-50">50</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                <path d="M1 1L7 7L13 1" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <span className="text-sm text-gray-700 font-medium">mục/trang</span>
        </div>

        {/* Center: Page info */}
        <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-orange-100">
          <span className="font-semibold text-orange-600">{startIndex}</span>
          <span className="mx-1">-</span>
          <span className="font-semibold text-orange-600">{endIndex}</span>
          <span className="mx-1.5 text-gray-400">|</span>
          <span className="font-semibold text-gray-800">{total}</span>
          <span className="ml-1">mục</span>
        </div>

        {/* Right: Page navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2.5 bg-white border-2 border-orange-200 rounded-lg hover:bg-orange-50 hover:border-orange-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-orange-200 transition-all shadow-sm"
            title="Trang trước"
          >
            <ChevronLeft size={18} className="text-orange-600" />
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                    page === pageNum
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md scale-105 border-2 border-orange-600'
                      : 'bg-white border-2 border-orange-200 text-gray-700 hover:bg-orange-50 hover:border-orange-400 hover:scale-105'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="p-2.5 bg-white border-2 border-orange-200 rounded-lg hover:bg-orange-50 hover:border-orange-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-orange-200 transition-all shadow-sm"
            title="Trang tiếp"
          >
            <ChevronRight size={18} className="text-orange-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;