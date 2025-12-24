import { useState, useEffect } from "react";
import { userService } from "../api/userService";

export const roleOptions = [
  { value: "", label: "Chọn vai trò" }, 
  { value: "admin", label: "Quản trị viên" },
  { value: "superadmin", label: "Super Admin" },
  { value: "post_office_manager", label: "Trưởng bưu cục" },
  { value: "post_office_staff", label: "Nhân viên bưu cục" },
  { value: "shop", label: "Chủ shop" },
  { value: "shipper", label: "Shipper" },
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

  const fetchUsers = async (currentPage = page, currentSearch = search) => {
    try {
      setLoading(true);
      const data = await userService.getUsers(currentPage, pageSize, currentSearch);
      setUsers(data.results || []);
      setTotalCount(data.count || 0);
    } catch (error) {
      console.error("Lỗi khi tải danh sách user:", error);
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || error.response?.data?.detail || "Bạn không có quyền truy cập tài nguyên này!";
        return { success: false, message: errorMessage };
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, search);
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
        if (page === 1 && !search) {
          setUsers((prev) => [...prev, newUser]);
        }
        await fetchUsers();
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

      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || error.response?.data?.detail || "Bạn không có quyền thực hiện hành động này!";
        return {
          success: false,
          message: errorMessage,
          errors: null,
        };
      }

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
          message:
            errorResponse.message || "Không thể lưu người dùng. Vui lòng thử lại!",
          errors: fieldErrors,
        };
      }

      return {
        success: false,
        message:
          errorResponse.message || "Không thể lưu người dùng. Vui lòng thử lại!",
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
    
    const roleToSend = selectedUser.newRole === "" ? null : selectedUser.newRole;

    try {
      const result = await userService.updateUser(selectedUser.id, { role: roleToSend });
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id ? { ...u, role: roleToSend } : u
          )
        );
      }
      return { success: true };
    } catch (error) {
      console.error("Lỗi khi đổi vai trò:", error);
      
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || error.response?.data?.detail || "Bạn không có quyền thay đổi vai trò người dùng!";
        return { success: false, message: errorMessage };
      }
      
      return { success: false, message: "Không thể thay đổi vai trò. Vui lòng thử lại!" };
    } finally {
      setOpenRoleModal(false);
      setSelectedUser(null);
    }
  };

  const handleToggleStatus = async (userId, newStatus) => {
    try {
      const result = await userService.toggleUserStatus(userId, newStatus);
      if (result.success) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, isActive: newStatus } : u
        ));
      }
      return result;
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái:", error);
      return { success: false, message: "Không thể thay đổi trạng thái" };
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
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await fetchUsers();
      }
      return { success: true, message: "Xóa người dùng thành công!" };
    } catch (error) {
      console.error("Lỗi khi xoá user:", error);
      
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || error.response?.data?.detail || "Bạn không có quyền xóa người dùng này!";
        return { success: false, message: errorMessage };
      }
      
      return { success: false, message: "Không thể xóa người dùng. Vui lòng thử lại!" };
    } finally {
      setOpenDeleteModal(false);
      setUserToDelete(null);
    }
  };

  return {
    users, 
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
    setUsers,
    handleToggleStatus
  };
};