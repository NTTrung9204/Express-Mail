import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { Add } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import { Switch } from "@mui/material";
import Pagination from "../components/common/Pagination";
import EditStaffModal from "../components/staffs/EditStaffModal";
import { getStaffsByPostOfficeId, createStaff } from "../api/staffAPI";
import { fetchUserPostOfficeId } from '../api/profileAPI';
import { togglePostOfficeUserStatus } from '../api/postOfficeUserAPI';
import authAPI from "../api/authAPI";

const Staffs = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [postOfficeId, setPostOfficeId] = useState(null);
  const [togglingStaff, setTogglingStaff] = useState(null);

  // State cho Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const fetchStaffs = useCallback(async (id, currentPage = page, currentLimit = limit) => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getStaffsByPostOfficeId(id, currentPage, currentLimit);
      if (response) {
        setStaffs(response.results || []);
        setTotal(response.count || 0);
      } else {
        setError("Không thể tải dữ liệu nhân viên.");
      }
    } catch (e) {
      console.error("Lỗi khi tải nhân viên:", e);
      toast.error("Đã xảy ra lỗi khi kết nối API.");
      setError("Đã xảy ra lỗi khi kết nối API.");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      
      const user = authAPI.getUser();
      const userId = user?.id; 

      if (!userId) {
        setError("Không tìm thấy User ID. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      const id = await fetchUserPostOfficeId(userId);
      
      if (id) {
        setPostOfficeId(id);
        fetchStaffs(id, 1, limit);
        setPage(1);
      } else {
        setError("Không thể xác định ID Bưu cục của người dùng.");
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    if (postOfficeId) {
      fetchStaffs(postOfficeId, page, limit);
    }
  }, [page, limit, postOfficeId, fetchStaffs]);

  const handleToggleStaffStatus = async (staff) => {
    if (!postOfficeId || !staff?.id) return;

    setTogglingStaff(staff.id);
    try {
      const result = await togglePostOfficeUserStatus(
        postOfficeId,
        staff.id,
        !staff.isActive
      );

      if (result.success) {
        setStaffs((prev) =>
          prev.map((s) =>
            s.id === staff.id ? { ...s, isActive: !s.isActive } : s
          )
        );
        toast.success(
          `Tài khoản đã ${!staff.isActive ? "kích hoạt" : "vô hiệu hóa"} thành công!`
        );
      } else {
        toast.error(result.message || "Không thể thay đổi trạng thái tài khoản");
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái:", error);
      toast.error("Đã xảy ra lỗi khi thay đổi trạng thái tài khoản");
    } finally {
      setTogglingStaff(null);
    }
  };

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingStaff(null);
  };

  const handleStaffUpdated = () => {
    fetchStaffs(postOfficeId, page, limit);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "username":
        if (!value.trim()) {
          error = "Username không được để trống";
        } else if (value.length < 3) {
          error = "Username phải có ít nhất 3 ký tự";
        }
        break;

      case "password":
        if (!value) {
          error = "Mật khẩu không được để trống";
        } else if (value.length < 6) {
          error = "Mật khẩu phải có ít nhất 6 ký tự";
        }
        break;

      case "confirmPassword":
        if (!value) {
          error = "Vui lòng xác nhận mật khẩu";
        } else if (value !== formData.password) {
          error = "Mật khẩu xác nhận không khớp";
        }
        break;

      case "firstName":
        if (!value.trim()) {
          error = "Họ không được để trống";
        }
        break;

      case "lastName":
        if (!value.trim()) {
          error = "Tên không được để trống";
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "Email không được để trống";
        } else if (!validateEmail(value)) {
          error = "Email không hợp lệ";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    const error = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));

    if (name === "password" && formData.confirmPassword) {
      const confirmError = formData.confirmPassword !== value 
        ? "Mật khẩu xác nhận không khớp" 
        : "";
      setFormErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }));
    }
  };

  const isFormValid = () => {
    const hasAllFields = 
      formData.username &&
      formData.password &&
      formData.confirmPassword &&
      formData.firstName &&
      formData.lastName &&
      formData.email;
    
    const hasNoErrors = Object.values(formErrors).every(error => !error);
    
    return hasAllFields && hasNoErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!postOfficeId) {
      toast.error("Không xác định được Bưu cục!");
      return;
    }

    setIsSubmitting(true);

    try {
      await createStaff(postOfficeId, formData);
      toast.success("Tạo tài khoản nhân viên thành công!");
      
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        email: "",
      });
      setFormErrors({});
      
      fetchStaffs(postOfficeId, page, limit);
    } catch (error) {
      console.error("Error creating staff:", error);
      
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const newErrors = {};
        
        if (apiErrors.user) {
          if (apiErrors.user.username) {
            newErrors.username = apiErrors.user.username[0];
          }
          if (apiErrors.user.email) {
            newErrors.email = apiErrors.user.email[0];
          }
          if (apiErrors.user.password) {
            newErrors.password = apiErrors.user.password[0];
          }
          if (apiErrors.user.firstName) {
            newErrors.firstName = apiErrors.user.firstName[0];
          }
          if (apiErrors.user.lastName) {
            newErrors.lastName = apiErrors.user.lastName[0];
          }
        }
        
        setFormErrors(newErrors);
        toast.error(error.response.data.message || "Kiểm tra dữ liệu thất bại.");
      } else {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error ||
                            "Đã xảy ra lỗi khi tạo tài khoản!";
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fff8f5] min-h-screen text-[#4b1d09]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#4b1d09]">Quản lý Nhân viên</h1>
        <p className="text-base text-[#7a4a32] mt-1">
          Quản lý tài khoản nhân viên trong hệ thống (ID Bưu cục: {postOfficeId || 'Đang tải...'})
        </p>
      </div>

      <div className="bg-white shadow-md rounded-xl p-5 mb-6 border border-orange-100">
        <h2 className="text-lg font-semibold text-[#4b1d09] mb-4">
          Danh sách tài khoản Nhân viên
        </h2>

        {loading && (
          <div className="text-center py-10 text-[#7a4a32]">Đang tải danh sách Nhân viên...</div>
        )}

        {error && (
          <div className="text-center py-10 text-red-500 border border-red-200 bg-red-50 rounded-lg">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-center border-b border-orange-100 text-[#4b1d09]">
                    <th className="py-2 px-2">Tên</th>
                    <th className="py-2 px-2">Username</th>
                    <th className="py-2 px-2">Email</th>
                    <th className="py-2 px-2">Trạng thái</th>
                    <th className="py-2 px-2">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {staffs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500">
                        Không có nhân viên nào
                      </td>
                    </tr>
                  ) : (
                    staffs.map((staff) => (
                      <tr
                        key={staff.id}
                        className="border-b border-orange-50 hover:bg-orange-50 transition-colors"
                      >
                        <td className="py-3 px-2 text-center">
                          {staff.firstName} {staff.lastName}
                        </td>
                        <td className="px-2 text-center">{staff.username}</td>
                        <td className="px-2 text-center">{staff.email}</td>
                        <td className="px-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                                checked={staff.isActive}
                                onChange={() => handleToggleStaffStatus(staff)}
                                disabled={togglingStaff === staff.id}
                                color="success"
                                size="small"
                              />
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                staff.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {staff.isActive ? "Hoạt động" : "Vô hiệu"}
                            </span>
                          </div>
                        </td>
                        <td className="px-2">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => openEditModal(staff)}
                              className="flex items-center gap-1 px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs transition cursor-pointer"
                            >
                              <EditIcon fontSize="small" /> Sửa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {total > 0 && (
              <Pagination
                page={page}
                limit={limit}
                total={total}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            )}
          </>
        )}
      </div>

      <div className="bg-white shadow-md rounded-xl p-5 border border-orange-100">
        <h2 className="text-lg font-semibold text-[#4b1d09] mb-4">
          Tạo tài khoản Nhân viên
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                name="username"
                type="text"
                placeholder="Nhập username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  formErrors.username
                    ? "border-red-500 focus:ring-red-500"
                    : "border-orange-200 focus:ring-orange-400"
                }`}
              />
              {formErrors.username && (
                <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                placeholder="Nhập email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  formErrors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-orange-200 focus:ring-orange-400"
                }`}
              />
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">
                Họ <span className="text-red-500">*</span>
              </label>
              <input
                name="firstName"
                type="text"
                placeholder="Nhập họ"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  formErrors.firstName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-orange-200 focus:ring-orange-400"
                }`}
              />
              {formErrors.firstName && (
                <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">
                Tên <span className="text-red-500">*</span>
              </label>
              <input
                name="lastName"
                type="text"
                placeholder="Nhập tên"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  formErrors.lastName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-orange-200 focus:ring-orange-400"
                }`}
              />
              {formErrors.lastName && (
                <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                name="password"
                type="password"
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                value={formData.password}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  formErrors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-orange-200 focus:ring-orange-400"
                }`}
              />
              {formErrors.password && (
                <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  formErrors.confirmPassword
                    ? "border-red-500 focus:ring-red-500"
                    : "border-orange-200 focus:ring-orange-400"
                }`}
              />
              {formErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isFormValid() && !isSubmitting
                  ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Add fontSize="small" /> 
              {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>

      <EditStaffModal
        open={editModalOpen}
        onClose={closeEditModal}
        staff={editingStaff}
        postOfficeId={postOfficeId}
        onUpdated={handleStaffUpdated}
      />
    </div>
  );
};

export default Staffs;