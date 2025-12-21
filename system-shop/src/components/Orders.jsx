import React from "react";
import EmptyState from "./EmptyState";
import NavigateNext from '@mui/icons-material/NavigateNext'; 
import NavigateBefore from '@mui/icons-material/NavigateBefore';

const Orders = ({ 
  data = [], 
  loading = false, 
  error = null, 
  pagination, 
  nextPage, 
  prevPage 
}) => {
  if (loading)
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-center text-gray-600">
        Đang tải dữ liệu...
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-center text-red-500">
        {error}
      </div>
    );

  if (!data || data.length === 0) return <EmptyState />;
  
  const hasPagination = pagination && pagination.total > 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto mb-6">
        {" "}
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 w-16 text-center">STT</th>
              <th className="p-3 w-64">Mã đơn hàng</th>
              <th className="p-3 w-80">Thông tin người nhận</th>
              <th className="p-3 text-center w-36">Giá trị đơn hàng</th>
              <th className="p-3 text-center w-30">Phí ship</th>
              <th className="p-3 text-center w-36">Khối lượng (g)</th>
              <th className="p-3 text-center w-56">Thanh toán</th>
            </tr>
          </thead>
          <tbody>
            {data.map((o, idx) => (
              <tr
                key={o.id}
                className="border-t border-gray-200 hover:bg-orange-50 transition-colors"
              >
                <td className="p-3 text-center">
                  {hasPagination
                    ? (pagination.page - 1) * pagination.limit + idx + 1
                    : idx + 1}
                </td>
                <td className="p-3">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="text-orange-600 font-semibold hover:underline cursor-pointer">
                      Đơn hàng #{o.id}
                    </span>
                    <span className="text-xs text-gray-500">
                      Mã vận đơn: {o.code}
                    </span>
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                      {o.status}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-gray-600 text-sm leading-relaxed">
                  <div>
                    <span className="font-semibold"> Người nhận: </span>
                      { o.receiver }
                  </div>
                  <div>
                    <span className="font-semibold">Số điện thoại: </span>
                    {o.phone}
                  </div>
                  <div>
                    <span className="font-semibold">Địa chỉ: </span>
                    {o.address}
                  </div>
                </td>
                <td className="p-3 text-red-600 font-semibold text-center">
                  {o.cod}
                </td>
                <td className="p-3 text-blue-500 font-semibold text-center">{o.shipping_cost}</td>
                <td className="p-3 text-center">{o.weight}</td>
                <td className="p-3 text-center">
                  <div className="font-medium text-gray-700">{o.payer}</div>
                  <div className="text-green-600 font-semibold mt-1">
                    {o.total}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && !error && hasPagination && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-gray-600">
              Hiển thị{" "}
              {((pagination.page - 1) * pagination.limit) + 1} -{" "}
              {Math.min(
                pagination.page * pagination.limit,
                pagination.total
              )}{" "}
              của {pagination.total} đơn hàng
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
      )}
    </div>
  );
};

export default Orders;