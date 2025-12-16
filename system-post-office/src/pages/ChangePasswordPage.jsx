import React, { useState } from "react";
import { userService } from "../api/userAPI"; 
import { Alert, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Mật khẩu mới là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Xác nhận mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const result = await userService.changePassword({
      password: formData.password,
    });

    if (result.success) {
      setFormData({ password: "", confirmPassword: "" });
      toast.success("Đổi mật khẩu thành công");
    } else {
      toast.error("Đổi mật khẩu thất bại");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-center mb-8 text-orange-600">
        Đổi mật khẩu
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu mới
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-transparent"
            placeholder="Nhập mật khẩu mới"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Xác nhận mật khẩu
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-transparent"
            placeholder="Nhập lại mật khẩu"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition flex items-center justify-center disabled:opacity-70"
        >
          {loading ? (
            <>
              <CircularProgress size={20} color="inherit" className="mr-2" />
              Đang xử lý...
            </>
          ) : (
            "Đổi mật khẩu"
          )}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordPage;