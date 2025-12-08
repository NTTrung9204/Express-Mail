import React, { useState, useEffect } from "react";
import UserModal from "../components/users/UserModal";
import ConfirmDeleteModal from "../components/users/ConfirmDeleteModal";
import { Add, Edit, Delete, Visibility, Search} from "@mui/icons-material";
import { IconButton, Switch, CircularProgress } from "@mui/material";
import { getPageNumbers } from "../utils/pagination";
import { roleOptions, useUserStore } from "../store/userStore";
import { toast } from "react-toastify";

const Users = () => {
  const {
    users,
    loading,
    page,
    pageSize,
    totalCount,
    open,
    mode,
    selected,
    openDeleteModal,
    userToDelete,

    fetchUsers,
    setPage,
    setOpen,
    setOpenDeleteModal,
    handleOpen,
    handleSave,
    handleDelete,
    confirmDelete,
    search,
    setSearch,

    setUsers,
    handleToggleStatus,
  } = useUserStore();

  const [searchInput, setSearchInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const totalPages = Math.ceil(totalCount / pageSize);

  const getRoleLabel = (roleValue) => {
    const found = roleOptions.find((r) => r.value === roleValue);
    return found ? found.label : "Không có vai trò";
  };

  const handleSearch = async () => {
    const trimmed = searchInput.trim();
    if (trimmed !== search) {
      setSearch(trimmed);
      setPage(1);
      setErrorMessage("");
      const result = await fetchUsers(1, trimmed);
      if (result && !result.success) {
        setErrorMessage(result.message);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    if (search === "") {
      setSearchInput("");
    }
  }, [search]);

  useEffect(() => {
    const loadInitialData = async () => {
      setErrorMessage("");
      const result = await fetchUsers(page, search);
      if (result && !result.success) {
        setErrorMessage(result.message);
      }
    };
    loadInitialData();
  }, [page]);

  const handleStatusToggle = async (userId, currentStatus, event) => {
    const newStatus = event.target.checked;

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: newStatus } : u))
    );

    const result = await handleToggleStatus(userId, newStatus);

    if (result.success) {
      toast.success(newStatus ? "Đã kích hoạt tài khoản!" : "Đã vô hiệu hóa tài khoản!");
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !newStatus } : u))
      );
      alert(result.message || "Không thể thay đổi trạng thái tài khoản");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-orange-50 min-h-screen">
      <div className="bg-gradient-to-r from-orange-200 to-orange-100 rounded-xl p-4">
        <h1 className="text-2xl font-bold mb-2">Quản lý Người dùng</h1>
        <p>Thêm, sửa, xóa và thay đổi vai trò người dùng.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex w-full md:w-auto gap-2">
          <input
            type="text"
            placeholder="Nhập tên người dùng"
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
          onClick={() => handleOpen("add")}
          className="flex items-center gap-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 cursor-pointer"
        >
          <Add fontSize="small" /> Thêm Người dùng
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-orange-100">
        {loading && !errorMessage ? (
          <div className="flex flex-col justify-center items-center py-16 text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
            <p className="mt-3 text-base">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <table className="min-w-full text-sm text-gray-700 table-fixed border-separate border-spacing-0">
              <thead className="bg-orange-200 text-gray-800 uppercase text-xs">
                <tr>
                  <th className="pl-6 pr-3 py-3 font-semibold w-[15%] text-center rounded-tl-lg">
                    Tên đăng nhập
                  </th>
                  <th className="px-3 py-3 font-semibold w-[30%] text-center">
                    Email
                  </th>
                  <th className="px-3 py-3 font-semibold w-[20%] text-center">
                    Vai trò
                  </th>
                  <th className="px-3 py-3 font-semibold w-[15%] text-center">
                    Trạng thái
                  </th>
                  <th className="pl-3 pr-6 py-3 font-semibold w-[20%] text-center rounded-tr-lg">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody>
                {errorMessage ? (
                  <tr>
                    <td colSpan="5" className="text-center text-red-600 font-medium p-6">
                      {errorMessage}
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-orange-100 hover:bg-orange-50 transition-all duration-150 text-center"
                    >
                      <td className="pl-6 pr-3 py-3">{user.username}</td>
                      <td className="px-3 py-3">{user.email}</td>
                      <td className="px-3 py-3 text-orange-700 font-medium">
                        {getRoleLabel(user.role)}
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={user.isActive || false}
                            onChange={(e) => handleStatusToggle(user.id, user.isActive, e)}
                            color="success"
                            size="small"
                          />
                          <span className={`text-sm font-medium ${user.isActive ? "text-green-600" : "text-red-600"}`}>
                            {user.isActive ? "Hoạt động" : "Bị khóa"}
                          </span>
                        </div>
                      </td>

                      <td className="pl-3 pr-6 py-3 space-x-2">
                        <button
                          onClick={() => handleOpen("view", user)}
                          className="text-blue-500 hover:text-blue-600 hover:scale-110 transition-transform cursor-pointer"
                          title="Xem"
                        >
                          <Visibility fontSize="small" />
                        </button>
                        <button
                          onClick={() => handleOpen("edit", user)}
                          className="text-green-500 hover:text-green-600 hover:scale-110 transition-transform cursor-pointer"
                          title="Sửa"
                        >
                          <Edit fontSize="small" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-red-500 hover:text-red-600 hover:scale-110 transition-transform cursor-pointer"
                          title="Xóa"
                        >
                          <Delete fontSize="small" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 p-4">
                      {search
                        ? `Không tìm thấy người dùng với từ khóa "${search}"`
                        : "Không có người dùng nào"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
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

      <UserModal
        open={open}
        onClose={() => setOpen(false)}
        mode={mode}
        user={selected}
        onSave={handleSave}
      />

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