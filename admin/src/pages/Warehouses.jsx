import React, { useState } from "react";
import WarehouseCard from "../components/warehouses/WarehouseCard";
import AddUserToWarehouseModal from "../components/warehouses/AddUserToWarehouseModal";
import WarehouseModal from "../components/warehouses/WarehouseModal"; // <- modal thêm/sửa kho

const initialWarehouses = [
  { id: 1, name: "Kho Hà Nội", address: "123 Đường Láng, Hà Nội", status: "Hoạt động" },
  { id: 2, name: "Kho TP.HCM", address: "456 Nguyễn Văn Cừ, TP.HCM", status: "Hoạt động" },
  { id: 3, name: "Kho Đà Nẵng", address: "789 Hải Phòng, Đà Nẵng", status: "Ngừng hoạt động" },
  { id: 4, name: "Kho Cần Thơ", address: "321 3/2, Cần Thơ", status: "Hoạt động" },
];

const mockUsers = [
  { id: 1, username: "an", email: "an@example.com" },
  { id: 2, username: "binh", email: "binh@example.com" },
  { id: 3, username: "cuong", email: "cuong@example.com" },
];

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState(initialWarehouses);

  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [openUserModal, setOpenUserModal] = useState(false);

  const [openWarehouseModal, setOpenWarehouseModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); 
  const [editingWarehouse, setEditingWarehouse] = useState(null);

  const handleAddUser = (w) => {
    setSelectedWarehouse(w);
    setOpenUserModal(true);
  };

  const handleSubmitUser = (userId) => {
    const user = mockUsers.find((u) => u.id === Number(userId));
    alert(`Đã thêm ${user.username} vào ${selectedWarehouse.name}`);
  };

  const openAddWarehouse = () => {
    setModalMode("add");
    setEditingWarehouse(null);
    setOpenWarehouseModal(true);
  };

  const openEditWarehouse = (w) => {
    setModalMode("edit");
    setEditingWarehouse(w);
    setOpenWarehouseModal(true);
  };

  const handleDeleteWarehouse = (w) => {
    setWarehouses((prev) => prev.filter((x) => x.id !== w.id));
  };

  const handleSubmitWarehouse = (form) => {
    if (modalMode === "add") {
      setWarehouses((prev) => [...prev, { ...form, id: Date.now() }]);
    } else if (modalMode === "edit") {
      setWarehouses((prev) =>
        prev.map((w) => (w.id === editingWarehouse.id ? { ...w, ...form } : w))
      );
    }
  };

  return (
    <div className="space-y-6 p-6 bg-orange-50 min-h-screen">
      <div className="bg-gradient-to-r from-orange-200 to-orange-100 rounded-xl p-4">
        <h1 className="text-2xl font-bold mb-2">
          Chào mừng đến với Trang Quản lý Kho
        </h1>
        <p>Quản lý thông tin kho; thêm, sửa, xoá kho.</p>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm kho..."
          className="w-full sm:w-1/2 px-3 py-2 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          onClick={openAddWarehouse}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 cursor-pointer"
        >
          + Thêm Kho
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {warehouses.map((w) => (
          <WarehouseCard
            key={w.id}
            name={w.name}
            address={w.address}
            status={w.status}
            onAddUser={() => handleAddUser(w)}
            onEdit={() => openEditWarehouse(w)}
            onDelete={() => handleDeleteWarehouse(w)}
          />
        ))}
      </div>

      <AddUserToWarehouseModal
        open={openUserModal}
        onClose={() => setOpenUserModal(false)}
        warehouse={selectedWarehouse}
        users={mockUsers}
        onSubmit={handleSubmitUser}
      />

      <WarehouseModal
        open={openWarehouseModal}
        onClose={() => setOpenWarehouseModal(false)}
        mode={modalMode}
        warehouse={editingWarehouse}
        onSubmit={handleSubmitWarehouse}
      />
    </div>
  );
}
