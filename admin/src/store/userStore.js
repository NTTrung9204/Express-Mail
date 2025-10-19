import { useState, useEffect } from "react";
import { userService } from "../api/userService";

export const roleOptions = [
  { value: "staff", label: "Nhân viên kho" },
  { value: "shipper", label: "Shipper" },
  { value: "shopOwner", label: "Chủ shop" },
  { value: "warehouseOwner", label: "Chủ kho" },
  { value: "superadmin", label: "Quản trị viên" },
];

export const useUserStore = (initialPage = 1, pageSize = 10) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);
  
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [selected, setSelected] = useState(null);
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize]);

  const handleOpen = (m, user = null) => {
    setMode(m);
    setSelected(user);
    setOpen(true);
  };

const handleSave = async (data) => {
    try {
      if (mode === "add") {
        const newUser = await userService.createUser(data);
        setUsers((prev) => [...prev, newUser]);
        return { success: true, message: "Thêm người dùng thành công!" };
      } else if (mode === "edit" && selected) {
        const updated = await userService.patchUser(selected.id, data);
        setUsers((prev) =>
          prev.map((u) => (u.id === selected.id ? updated : u))
        );
        return { success: true, message: "Cập nhật người dùng thành công!" };
      }
    } catch (error) {
      console.error("Lỗi khi lưu user:", error);
      const errorResponse = error.response?.data || {
        message: "Không thể lưu người dùng. Vui lòng thử lại!",
        errors: null,
      };

      if (errorResponse.errors) {
        const fieldErrors = {};
        const errorMessages = [];
        Object.entries(errorResponse.errors).forEach(([field, messages]) => {
          const errorMessage = Array.isArray(messages) ? messages[0] : messages;
          fieldErrors[field] = errorMessage;
          errorMessages.push(errorMessage);
        });
        return {
          success: false,
          message: errorResponse.message || "Không thể lưu người dùng. Vui lòng thử lại!",
          errors: fieldErrors, // Trả về { username: "Tên đăng nhập đã được sử dụng", email: "Email đã tồn tại" }
        };
      }

      return {
        success: false,
        message: errorResponse.message || "Không thể lưu người dùng. Vui lòng thử lại!",
        errors: null,
      };
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
      setUsers(prev =>
        prev.map(u =>
          u.id === selectedUser.id ? { ...u, role: selectedUser.newRole } : u
        )
      );
      return { success: true };
    } catch (error) {
      console.error("Lỗi khi đổi vai trò:", error);
      return { success: false };
    } finally {
      setOpenRoleModal(false);
      setSelectedUser(null);
    }
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await userService.deleteUser(userToDelete.id);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      return { success: true, message: "Xóa người dùng thành công!" };
    } catch (error) {
      console.error("Lỗi khi xoá user:", error);
      return { success: false, message: "Không thể xóa người dùng. Vui lòng thử lại!" };
    } finally {
      setOpenDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return {
    users: filteredUsers,
    loading,
    search,
    page,
    pageSize,
    totalCount,
    open,
    mode,
    selected,
    openRoleModal,
    selectedUser,
    openDeleteModal,
    userToDelete,

    setSearch,
    setPage,
    setOpen,
    setOpenDeleteModal,
    setOpenRoleModal,
    handleOpen,
    handleSave,
    handleRoleChange,
    handleConfirmRole,
    handleDelete,
    confirmDelete,
    fetchUsers,
  };
};