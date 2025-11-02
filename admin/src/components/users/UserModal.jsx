import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PermissionModal from "./PermissionModal";

const ROLE_GROUP_MAP = {
  admin: 1, 
  post_office_manager: 2, 
  post_office_staff: 3, 
  shop: 4, 
  shipper: 5, 
};

const UserModal = ({ open, onClose, mode = "add", user = {}, onSave }) => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    firstName: "",
    lastName: "",
  });

  const [excludePermissions, setExcludePermissions] = useState([]);
  const [errors, setErrors] = useState({});
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const isView = mode === "view";

  useEffect(() => {
    const safeUser = user || {}; 

    if (mode === "edit" || mode === "view") {
      setForm({
        username: safeUser.username || "",
        password: "",
        confirmPassword: "",
        email: safeUser.email || "",
        firstName: safeUser.firstName || "",
        lastName: safeUser.lastName || "",
      });
      setExcludePermissions(safeUser.excludePermissions || []); 
      console.log("DEBUG(UserModal): User Role:", safeUser.role, "Exclude Permissions:", safeUser.excludePermissions || []); // DEBUG
    } else if (mode === "add") {
      setForm({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        firstName: "",
        lastName: "",
      });
      setExcludePermissions([]); 
    }
    setErrors({});
  }, [open, mode, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validate = () => {
    const newErrors = {};
    if (!form.firstName) newErrors.firstName = "Vui lòng nhập họ.";
    if (!form.lastName) newErrors.lastName = "Vui lòng nhập tên.";
    if (!form.username) newErrors.username = "Vui lòng nhập tên đăng nhập.";
    if (!form.email) newErrors.email = "Vui lòng nhập email.";
    else if (!isValidEmail(form.email)) newErrors.email = "Email không hợp lệ.";

    if (mode === "add" || form.password) {
      if (!form.password) newErrors.password = "Vui lòng nhập mật khẩu.";
      else if (form.password.length < 6)
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
      if (form.password !== form.confirmPassword)
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const dataToSend = { ...form, excludePermissions: excludePermissions };
    delete dataToSend.confirmPassword;
    if (mode === "edit" && !form.password) delete dataToSend.password;
    
    console.log("DEBUG(UserModal): Dữ liệu gửi đi:", dataToSend); 

    const result = await onSave(dataToSend);

    if (!result?.success) {
      if (result?.errors && typeof result.errors === "object") {
        const fieldErrors = {};
        const errorMessages = [];

        Object.entries(result.errors).forEach(([field, messages]) => {
          const firstMessage = Array.isArray(messages) ? messages[0] : messages;
          fieldErrors[field] = firstMessage;
          errorMessages.push(firstMessage);
        });

        setErrors(fieldErrors);
        toast.error(errorMessages.join("; "));
      } else {
        toast.error(result?.message || "❌ Có lỗi xảy ra!");
      }
      return;
    }

    toast.success(result.message || "Thành công!");
    onClose();
  };

  const userGroupId = ROLE_GROUP_MAP[user?.role] || 1;
  console.log("DEBUG(UserModal): Target Group ID:", userGroupId); 

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        onClick={onClose}
      >
        <div
          className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between mb-6 border-b pb-3 sticky top-0 bg-white z-10">
            <h2 className="text-2xl font-semibold text-orange-600">
              {mode === "add"
                ? "Thêm người dùng"
                : mode === "edit"
                ? "Sửa thông tin người dùng"
                : "Thông tin người dùng"}
            </h2>
            <button
              onClick={onClose}
              className="text-4xl leading-none hover:text-orange-600 cursor-pointer"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-1 font-medium">Họ</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                disabled={isView}
                placeholder="Nhập họ"
                className={`w-full p-2 border rounded-lg outline-none ${
                  errors.firstName ? "border-red-500" : "focus:border-orange-500"
                }`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium">Tên</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                disabled={isView}
                placeholder="Nhập tên"
                className={`w-full p-2 border rounded-lg outline-none ${
                  errors.lastName ? "border-red-500" : "focus:border-orange-500"
                }`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-1 font-medium">Tên đăng nhập</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                disabled={isView}
                placeholder="Nhập tên đăng nhập"
                className={`w-full p-2 border rounded-lg outline-none ${
                  errors.username ? "border-red-500" : "focus:border-orange-500"
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                disabled={isView}
                placeholder="Nhập email"
                className={`w-full p-2 border rounded-lg outline-none ${
                  errors.email ? "border-red-500" : "focus:border-orange-500"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {!isView && (
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block mb-1 font-medium">Mật khẩu</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={
                    mode === "edit"
                      ? "Để trống nếu không đổi mật khẩu"
                      : "Nhập mật khẩu"
                  }
                  className={`w-full p-2 border rounded-lg outline-none ${
                    errors.password
                      ? "border-red-500"
                      : "focus:border-orange-500"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Xác nhận mật khẩu
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  className={`w-full p-2 border rounded-lg outline-none ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "focus:border-orange-500"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          )}

          {mode !== "add" && (
            <div className="flex justify-start mt-6">
              <button
                onClick={() => setShowPermissionModal(true)}
                className={`px-5 py-2 rounded-lg ${
                  isView
                    ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                {isView ? "Xem hồ sơ" : "Chỉnh sửa hồ sơ"}
              </button>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
            >
              Hủy
            </button>
            {!isView && (
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer"
              >
                {mode === "edit" ? "Cập nhật" : "Thêm mới"}
              </button>
            )}
          </div>
        </div>
      </div>

      {showPermissionModal && (
        <PermissionModal
          open={showPermissionModal}
          onClose={() => setShowPermissionModal(false)}
          excludePermissions={excludePermissions}
          setExcludePermissions={setExcludePermissions}
          targetGroupId={userGroupId}
          isView={isView}
          user={user}
        />
      )}
    </>
  );
};

export default UserModal;