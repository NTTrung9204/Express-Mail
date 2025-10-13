import React, { useState, useEffect } from "react";

const UserModal = ({ open, onClose, mode = "add", user = {}, onSave }) => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    firstName: "",
    lastName: "",
  });

  const [errors, setErrors] = useState({});
  const isView = mode === "view";

  useEffect(() => {
    if (mode === "edit" || mode === "view") {
      setForm({
        username: user.username || "",
        password: "",
        confirmPassword: "",
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    } else if (mode === "add") {
      setForm({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        firstName: "",
        lastName: "",
      });
    }
    setErrors({});
  }, [mode, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // reset lỗi cho field đó
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validate = () => {
    const newErrors = {};
    if (!form.firstName) newErrors.firstName = "Vui lòng nhập họ.";
    if (!form.lastName) newErrors.lastName = "Vui lòng nhập tên.";
    if (!form.username) newErrors.username = "Vui lòng nhập tên đăng nhập.";
    if (!form.email) newErrors.email = "Vui lòng nhập email.";
    else if (!isValidEmail(form.email)) newErrors.email = "Email không hợp lệ.";

    // ✅ Chỉ kiểm tra mật khẩu nếu đang thêm hoặc người dùng có nhập mật khẩu mới
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

    const dataToSend = { ...form };
    delete dataToSend.confirmPassword;

    // ✅ Nếu đang sửa và mật khẩu trống → không gửi field này
    if (mode === "edit" && !form.password) {
      delete dataToSend.password;
    }

    await onSave(dataToSend);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl p-8 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between mb-6 border-b pb-3">
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

        {/* Họ và Tên */}
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

        {/* Username + Email */}
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

        {/* Mật khẩu & Xác nhận */}
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
                  errors.password ? "border-red-500" : "focus:border-orange-500"
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

        {/* Buttons */}
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
  );
};

export default UserModal;
