import React from "react";
import { Add, Edit, Delete, People } from "@mui/icons-material";
import { useWarehouseStore } from "../store/warehouseStore";
import { getPageNumbers } from "../utils/pagination";
import WarehouseModal from "../components/warehouses/WarehouseModal";
import AddUserToWarehouseModal from "../components/warehouses/AddUserToWarehouseModal";
import ConfirmDeleteModal from "../components/warehouses/ConfirmDeleteModal";

export default function Warehouses() {
  const {
    warehouses,
    total,
    page,
    limit,
    loading,
    search,
    modalMode,
    openWarehouseModal,
    editingWarehouse,
    openUserModal,
    selectedWarehouse,
    openDeleteModal,
    warehouseToDelete,
    setPage,
    setSearch,
    setOpenWarehouseModal,
    setOpenUserModal,
    setOpenDeleteModal,
    handleAddUser,
    handleSubmitUser,
    openAddWarehouse,
    openEditWarehouse,
    handleSubmitWarehouse,
    handleDeleteWarehouse,
    confirmDeleteWarehouse,
  } = useWarehouseStore();

  const totalPages = Math.ceil(total / limit) || 1;

  const filtered = warehouses.filter((w) => w.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6 bg-orange-50 min-h-screen">
      <div className="bg-gradient-to-r from-orange-200 to-orange-100 rounded-xl p-4">
        <h1 className="text-2xl font-bold mb-2">Trang Quản lý Kho</h1>
        <p>Thêm, sửa, xoá và gán người dùng cho kho.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm kho..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          onClick={openAddWarehouse}
          className="flex items-center gap-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 cursor-pointer"
        >
          <Add fontSize="small" /> Thêm Kho
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-orange-100">
        <table className="min-w-full text-sm text-gray-700 table-fixed border-separate border-spacing-0">
          <thead className="bg-orange-200 text-gray-800 uppercase text-xs">
            <tr>
              <th className="py-3 text-center w-1/5">Tên kho</th>
              <th className="py-3 text-center w-1/5">Địa chỉ</th>
              <th className="py-3 text-center w-1/5">Phường / Xã</th>
              <th className="py-3 text-center w-1/5">Tỉnh / Thành phố</th>
              <th className="py-3 text-center w-1/5">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filtered.length ? (
              filtered.map((w) => (
                <tr key={w.id} className="hover:bg-orange-50 border-b border-orange-100">
                  <td className="text-center py-3">{w.name}</td>
                  <td className="text-center py-3">{w.address}</td>
                  <td className="text-center py-3">{w.wardCommune || "-"}</td>
                  <td className="text-center py-3">{w.provinceCity || "-"}</td>
                  <td className="text-center space-x-2 py-3">
                    <button
                      onClick={() => handleAddUser(w)}
                      className="text-blue-500 hover:text-blue-600 cursor-pointer"
                      title="Thêm người dùng"
                    >
                      <People fontSize="small" />
                    </button>
                    <button
                      onClick={() => openEditWarehouse(w)}
                      className="text-green-500 hover:text-green-600 cursor-pointer"
                      title="Sửa"
                    >
                      <Edit fontSize="small" />
                    </button>
                    <button
                      onClick={() => handleDeleteWarehouse(w)}
                      className="text-red-500 hover:text-red-600 cursor-pointer"
                      title="Xoá"
                    >
                      <Delete fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 p-4">
                  Không tìm thấy kho nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 p-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className={`px-3 py-1.5 rounded-lg border transition ${
              page === 1
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-orange-600 border-orange-300 hover:bg-orange-100 cursor-pointer"
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
                disabled={num === page}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  num === page
                    ? "bg-orange-500 text-white border-orange-500 cursor-default"
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
            className={`px-3 py-1.5 rounded-lg border transition ${
              page === totalPages
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-orange-600 border-orange-300 hover:bg-orange-100 cursor-pointer"
            }`}
          >
            »
          </button>
        </div>
      )}

       <AddUserToWarehouseModal
        open={openUserModal}
        onClose={() => setOpenUserModal(false)}
        warehouse={selectedWarehouse}
        onSubmit={handleSubmitUser}
      />

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
