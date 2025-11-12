import React, { useEffect, useState } from "react";
import { Add, Edit, Delete, Visibility, Search } from "@mui/icons-material";
import { useWarehouseStore } from "../store/warehouseStore";
import { getPageNumbers } from "../utils/pagination";
import WarehouseModal from "../components/warehouses/WarehouseModal";
import ConfirmDeleteModal from "../components/warehouses/ConfirmDeleteModal";

export default function Warehouses() {
  const {
    warehouses,
    total,
    page,
    pageSize,
    loading,
    search,
    modalMode,
    openWarehouseModal,
    editingWarehouse,
    openDeleteModal,
    warehouseToDelete,
    setPage,
    setOpenWarehouseModal,
    setOpenDeleteModal,
    openAddWarehouse,
    openEditWarehouse,
    openViewWarehouse,
    handleSubmitWarehouse,
    handleDeleteWarehouse,
    confirmDeleteWarehouse,
    searchWarehouses,
    fetchWarehouses,
  } = useWarehouseStore();

  const [searchInput, setSearchInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const totalPages = Math.ceil(total / pageSize) || 1;

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const loadInitialData = async () => {
      setErrorMessage("");
      const result = await fetchWarehouses(page, search);
      if (result && !result.success) {
        setErrorMessage(result.message);
      }
    };
    loadInitialData();
  }, [page]);

  const handleSearch = async () => {
    setErrorMessage("");
    searchWarehouses(searchInput);
    const result = await fetchWarehouses(1, searchInput);
    if (result && !result.success) {
      setErrorMessage(result.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="p-6 space-y-6 bg-orange-50 min-h-screen">
      <div className="bg-gradient-to-r from-orange-200 to-orange-100 rounded-xl p-4">
        <h1 className="text-2xl font-bold mb-2">Quản lý Kho</h1>
        <p>Thêm, sửa, xóa và quản lý kho bưu cục.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex w-full md:w-auto gap-2">
          <input
            type="text"
            placeholder="Nhập tên kho"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full md:w-96 px-4 py-2.5 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-700"
          />
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-lg hover:bg-orange-600 transition shadow-md font-medium cursor-pointer"
          >
            <Search fontSize="small" /> Tìm kiếm
          </button>
        </div>
        <button
          onClick={openAddWarehouse}
          className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 transition shadow-md font-medium cursor-pointer"
        >
          <Add fontSize="small" /> Thêm Kho Mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-orange-200 text-gray-800 uppercase text-xs font-semibold">
              <tr>
                <th className="py-4 px-6 text-center">Tên kho</th>
                <th className="py-4 px-6 text-center">Địa chỉ</th>
                <th className="py-4 px-6 text-center">Tỉnh / Thành</th>
                <th className="py-4 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && !errorMessage ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-500">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                    <p className="mt-2">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td colSpan="4" className="text-center text-red-600 font-medium py-12">
                    {errorMessage}
                  </td>
                </tr>
              ) : warehouses.length > 0 ? (
                warehouses.map((w) => (
                  <tr key={w.id} className="hover:bg-orange-50 border-b border-orange-100 transition text-center">
                    <td className="py-4 px-6 font-medium">{w.name}</td>
                    <td className="py-4 px-6 text-gray-600">{w.address}</td>
                    <td className="py-4 px-6">{w.displayProvince || "-"}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => openViewWarehouse(w)}
                          className="text-blue-600 hover:text-blue-800 transition cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Visibility fontSize="small" />
                        </button>
                        <button
                          onClick={() => openEditWarehouse(w)}
                          className="text-green-600 hover:text-green-800 transition cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit fontSize="small" />
                        </button>
                        <button
                          onClick={() => handleDeleteWarehouse(w)}
                          className="text-red-600 hover:text-red-800 transition cursor-pointer"
                          title="Xóa"
                        >
                          <Delete fontSize="small" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-500">
                    <p>
                      {search
                        ? `Không tìm thấy kho nào với từ khóa "${search}"`
                        : "Không có kho nào"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && !errorMessage && (
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

      <WarehouseModal
        open={openWarehouseModal}
        onClose={() => setOpenWarehouseModal(false)}
        mode={modalMode}
        warehouse={editingWarehouse}
        onSubmit={handleSubmitWarehouse}
      />

      <ConfirmDeleteModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={confirmDeleteWarehouse}
        warehouse={warehouseToDelete}
      />
    </div>
  );
}