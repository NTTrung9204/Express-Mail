import React, { useState, useEffect } from "react";
import SearchBar from "../components/users/SearchBar";
import UserModal from "../components/users/UserModal";
import RoleModal from "../components/users/RoleModal";
import ConfirmDeleteModal from "../components/users/ConfirmDeleteModal";
import { Add, Edit, Delete, Visibility } from "@mui/icons-material";
import { userService } from "../api/userService";

const roleOptions = [
  { value: "staff", label: "Nhân viên kho" },
  { value: "shipper", label: "Shipper" },
  { value: "shopOwner", label: "Chủ shop" },
  { value: "warehouseOwner", label: "Chủ kho" },
  { value: "superadmin", label: "Quản trị viên" },
];

const Users = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selected, setSelected] = useState(null);
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // ✅ Gọi API khi component mount hoặc page thay đổi
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.getUsers(page, pageSize);
        setUsers(data.results || []);
        setTotalCount(data.count || 0);
      } catch (error) {
        console.error("Lỗi khi tải danh sách user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, pageSize]);

  const filtered = users.filter((u) =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = (m, user = null) => {
    setMode(m);
    setSelected(user);
    setOpen(true);
  };

  // ✅ Hàm lưu user (thêm mới hoặc cập nhật)
  const handleSave = async (data) => {
    try {
      if (mode === "add") {
      // 🔹 Gọi API thêm mới user
      const newUser = await userService.createUser(data);
      setUsers((prev) => [...prev, newUser]);
      alert("Thêm người dùng thành công!");
    } else if (mode === "edit" && selected) {
      // 🔹 Gọi PATCH để cập nhật user (chỉ thay đổi field được gửi)
      const updated = await userService.patchUser(selected.id, data);
      setUsers((prev) =>
        prev.map((u) => (u.id === selected.id ? updated : u))
      );
      alert("Cập nhật người dùng thành công!");
    }

    } catch (error) {
      console.error("Lỗi khi lưu user:", error);
      alert("Không thể lưu người dùng. Vui lòng thử lại!");
    } finally {
      setOpen(false);
    }
  };

  const handleRoleChange = (user, newRole) => {
    setSelectedUser({ ...user, newRole });
    setOpenRoleModal(true);
  };

  const handleConfirmRole = async () => {
    if (!selectedUser) return;
    try {
      await userService.updateUser(selectedUser.id, {
        role: selectedUser.newRole,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, role: selectedUser.newRole } : u
        )
      );
    } catch (error) {
      console.error("Lỗi khi đổi vai trò:", error);
    } finally {
      setOpenRoleModal(false);
      setSelectedUser(null);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await userService.deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      alert("Xóa người dùng thành công!");
    } catch (error) {
      console.error("Lỗi khi xoá user:", error);
      alert("Không thể xóa người dùng. Vui lòng thử lại!");
    } finally {
      setOpenDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setOpenDeleteModal(true);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const getPageNumbers = (current, total) => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let last;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (last) {
        if (i - last === 2) {
          rangeWithDots.push(last + 1);
        } else if (i - last !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      last = i;
    }

    return rangeWithDots;
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
        {loading ? (
          <div className="text-center p-6 text-gray-500">Đang tải...</div>
        ) : (
          <>
            {/* bảng danh sách user */}
            <table className="min-w-full text-sm text-gray-700 table-fixed border-separate border-spacing-0">
              <thead className="bg-orange-200 text-gray-800 uppercase text-xs">
                <tr>
                  <th className="pl-6 pr-3 py-3 font-semibold w-[15%] text-center rounded-tl-lg">
                    Tên đăng nhập
                  </th>
                  <th className="px-3 py-3 font-semibold w-[35%] text-center">Email</th>
                  <th className="px-3 py-3 font-semibold w-[35%] text-center">Vai trò</th>
                  <th className="pl-3 pr-6 py-3 font-semibold w-[15%] text-center rounded-tr-lg">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-orange-100 hover:bg-orange-50 transition-all duration-150 text-center"
                  >
                    <td className="pl-6 pr-3 py-3">{user.username}</td>
                    <td className="px-3 py-3">{user.email}</td>
                    <td className="px-3 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user, e.target.value)}
                        className="w-full max-w-[160px] border border-orange-200 bg-orange-50 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-orange-100 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition cursor-pointer text-center"
                      >
                        {roleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="pl-3 pr-6 py-3 space-x-2">
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
                        onClick={() => handleDelete(user)}
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
                    <td colSpan="4" className="text-center text-gray-500 p-4">
                      Không tìm thấy người dùng
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* phân trang */}
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
                    <span key={index} className="px-3 py-1 text-gray-500 select-none">
                      ...
                    </span>
                  ) : (
                    <button
                      key={index}
                      onClick={() => setPage(num)}
                      className={`px-3 py-1.5 rounded-lg border transition ${
                        num === page
                          ? "bg-orange-500 text-white border-orange-500"
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
          </>
        )}
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

      <ConfirmDeleteModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={confirmDelete}
        username={userToDelete?.username}
      />
    </div>
  );
};

export default Users;
