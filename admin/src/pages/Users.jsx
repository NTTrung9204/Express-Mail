import React, { useState } from "react";
import SearchBar from "../components/users/SearchBar";
import UserModal from "../components/users/UserModal";
import RoleModal from "../components/users/RoleModal";
import { Add, Edit, Delete, Visibility } from "@mui/icons-material";

const initialUsers = [
  {
    id: 1,
    username: "an",
    email: "an@example.com",
    phone: "0123456789",
    cardId: "123",
    status: "active",
    role: "staff",
  },
  {
    id: 2,
    username: "binh",
    email: "binh@example.com",
    phone: "0987654321",
    cardId: "124",
    status: "inactive",
    role: "shipper",
  },
  {
    id: 3,
    username: "cuong",
    email: "cuong@example.com",
    phone: "0112233445",
    cardId: "125",
    status: "active",
    role: "warehouseOwner",
  },
];

const roleOptions = [
  { value: "staff", label: "Nhân viên kho" },
  { value: "shipper", label: "Shipper" },
  { value: "shopOwner", label: "Chủ shop" },
  { value: "warehouseOwner", label: "Chủ kho" },
];

const Users = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [selected, setSelected] = useState(null);
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = (m, user = null) => {
    setMode(m);
    setSelected(user);
    setOpen(true);
  };

  const handleSave = (data) => {
    if (mode === "add") {
      setUsers((prev) => [...prev, { ...data, id: Date.now() }]);
    } else if (mode === "edit") {
      setUsers((prev) =>
        prev.map((u) => (u.id === selected.id ? { ...u, ...data } : u))
      );
    }
    setOpen(false);
  };

  const handleRoleChange = (user, newRole) => {
    setSelectedUser({ ...user, newRole });
    setOpenRoleModal(true);
  };

  const handleConfirmRole = () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id ? { ...u, role: selectedUser.newRole } : u
      )
    );
    setOpenRoleModal(false);
    setSelectedUser(null);
  };

  return (
    <div className="p-6 space-y-6 bg-orange-50 min-h-screen">
      <div className="bg-gradient-to-r from-orange-200 to-orange-100 rounded-xl p-4">
        <h1 className="text-2xl font-bold mb-2">
          Chào mừng đến với Trang Quản lý Người dùng
        </h1>
        <p>Quản lý thông tin người dùng; thêm, sửa, xoá người dùng.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <SearchBar value={search} onChange={setSearch} />
        <button
          onClick={() => handleOpen("add")}
          className="flex items-center gap-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 cursor-pointer"
        >
          <Add fontSize="small" /> Thêm Người dùng
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-orange-100">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-orange-200 text-gray-800 uppercase text-xs">
            <tr>
              <th className="p-3 font-semibold">Tên đăng nhập</th>
              <th className="p-3 font-semibold">Email</th>
              <th className="p-3 font-semibold">SĐT</th>
              <th className="p-3 font-semibold">Mã thẻ</th>
              <th className="p-3 font-semibold">Trạng thái</th>
              <th className="p-3 font-semibold">Vai trò</th>
              <th className="p-3 font-semibold text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr
                key={user.id}
                className="border-b border-orange-100 hover:bg-orange-50 transition-all duration-150"
              >
                <td className="p-3">{user.username}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.phone}</td>
                <td className="p-3">{user.cardId}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.status === "active" ? "Hoạt động" : "Ngưng"}
                  </span>
                </td>

                <td className="p-3">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user, e.target.value)}
                    className="w-[140px] border border-orange-200 bg-orange-50 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-orange-100 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition cursor-pointer"
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="p-3 text-center space-x-2">
                  <button
                    onClick={() => handleOpen("view", user)}
                    className="text-blue-500 hover:text-blue-600 transition-transform hover:scale-110 cursor-pointer"
                    title="Xem"
                  >
                    <Visibility fontSize="small" />
                  </button>
                  <button
                    onClick={() => handleOpen("edit", user)}
                    className="text-green-500 hover:text-green-600 transition-transform hover:scale-110 cursor-pointer"
                    title="Sửa"
                  >
                    <Edit fontSize="small" />
                  </button>
                  <button
                    onClick={() =>
                      setUsers((prev) => prev.filter((u) => u.id !== user.id))
                    }
                    className="text-red-500 hover:text-red-600 transition-transform hover:scale-110 cursor-pointer"
                    title="Xoá"
                  >
                    <Delete fontSize="small" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 p-4">
                  Không tìm thấy người dùng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <UserModal
        open={open}
        onClose={() => setOpen(false)}
        mode={mode}
        user={selected}
        onSave={handleSave}
      />

      {openRoleModal && selectedUser && (
        <RoleModal
          role={selectedUser.newRole}
          onConfirm={handleConfirmRole}
          onClose={() => setOpenRoleModal(false)}
        />
      )}
    </div>
  );
};

export default Users;
