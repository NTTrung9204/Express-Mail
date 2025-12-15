import React, { useEffect } from "react";
import { IconButton, Switch, CircularProgress } from "@mui/material";
import { Visibility, Add } from "@mui/icons-material";
import { useShippingRateStore } from "../store/shippingRateStore";
import ShippingRateModal from "../components/shipping-rate/ShippingRateModal";
import ProtectedComponent from '../components/common/ProtectedComponent';
import { getPageNumbers } from "../utils/pagination";
import { toast } from "react-toastify";

export default function ShippingRate() {
  const {
    shippingRates,
    loading,
    error, 
    page,
    totalCount,
    pageSize,
    open,
    mode,
    selected,
    setPage,
    setOpen,
    handleOpen,
    handleSave,
    handleToggleActive,
    fetchShippingRates,
  } = useShippingRateStore();

  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    fetchShippingRates();
  }, [page]);

  const handleSwitchToggle = async (id, currentStatus) => {
    try {
      await handleToggleActive(id, currentStatus);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("Bạn không có quyền thay đổi trạng thái phí ship.");
      } else {
        toast.error("Không thể thay đổi trạng thái phí ship.");
      }
    }
  };

  return (
    <div className="p-6 bg-orange-50 min-h-screen">
      <div className="bg-orange-100 p-4 rounded-lg mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Trang Quản lý Phí Ship
        </h1>
        <p className="text-gray-700 mt-1">
          Quản lý và tính toán phí ship cho hệ thống.
        </p>
      </div>

      <div className="flex justify-end gap-2 mb-6">
        <ProtectedComponent perm="shipping.add_shippingrate">
          <button
            onClick={() => handleOpen("add")}
            className="flex items-center gap-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition cursor-pointer"
          >
            <Add fontSize="small" /> Thêm Phí Ship
          </button>
        </ProtectedComponent>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gradient-to-r from-orange-200 to-orange-100 text-gray-800">
            <tr>
              <th className="py-3 px-4 font-semibold text-center">Phí cơ bản</th>
              <th className="py-3 px-4 font-semibold text-center">Phí mỗi km</th>
              <th className="py-3 px-4 font-semibold text-center">Hệ số chia thể tích</th>
              <th className="py-3 px-4 font-semibold text-center">Phí mỗi kg</th>
              <ProtectedComponent perm="shipping.change_shippingrate_status">
                <th className="py-3 px-4 font-semibold text-center">Trạng thái</th>
              </ProtectedComponent>
              <th className="py-3 px-4 font-semibold text-center">Ngày tạo</th>
              <th className="py-3 px-4 font-semibold text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-red-500 font-medium">
                  {error}
                </td>
              </tr>
            ) : loading ? (
              <tr>
                <td colSpan="7" className="text-center py-6">
                  <CircularProgress size={28} />
                </td>
              </tr>
            ) : shippingRates.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  Chưa có phí ship nào.
                </td>
              </tr>
            ) : (
              shippingRates.map((item, index) => (
                <tr
                  key={item.id}
                  className={index % 2 === 0 ? "bg-orange-50" : "bg-white"}
                >
                  <td className="py-3 px-4 text-center">
                    {item.baseFee.toLocaleString()}đ
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.ratePerKm.toLocaleString()}đ
                  </td>
                  <td className="py-3 px-4 text-center">{item.volumetricDivisor}</td>
                  <td className="py-3 px-4 text-center">
                    {item.ratePerKg.toLocaleString()}đ
                  </td>
                    <ProtectedComponent perm="shipping.change_shippingrate_status">
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <Switch
                            checked={item.isActive}
                            onChange={() => handleSwitchToggle(item.id, item.isActive)}
                            color="success"
                          />
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.isActive ? "Đang dùng" : "Ngừng"}
                          </span>
                        </div>
                      </td>
                  </ProtectedComponent>
                  <td className="py-3 px-4 text-center">
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleOpen("view", item)}
                    >
                      <Visibility />
                    </IconButton>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 p-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className={`px-3 py-1.5 rounded-lg border ${
              page === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-orange-100 text-orange-600 border-orange-300 cursor-pointer"
            }`}
          >
            «
          </button>

          {getPageNumbers(page, totalPages).map((num, index) =>
            num === "..." ? (
              <span
                key={index}
                className="px-3 py-1 text-gray-500 select-none"
              >
                ...
              </span>
            ) : (
              <button
                key={index}
                onClick={() => setPage(num)}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  num === page
                    ? "bg-orange-500 text-white border-orange-500 cursor-pointer"
                    : "bg-white hover:bg-orange-100 text-orange-600 border-orange-300 cursor-pointer"
                }`}
              >
                {num}
              </button>
            )
          )}

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className={`px-3 py-1.5 rounded-lg border ${
              page === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-orange-100 text-orange-600 border-orange-300 cursor-pointer"
            }`}
          >
            »
          </button>
        </div>
      )}

      <ShippingRateModal
        open={open}
        mode={mode}
        selected={selected}
        onClose={() => setOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
