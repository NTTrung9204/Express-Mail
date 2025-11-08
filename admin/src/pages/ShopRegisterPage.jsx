import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { userService } from "../api/userService";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import VietmapPicker from "../components/common/VietmapPicker";
import bgImg from "../assets/ghn.png";
import logoImg from "../assets/logo.png";

const ShopRegisterPage = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    user: {
      username: "",
      password: "",
      email: "",
      firstName: "",
      lastName: "",
    },
    profile: {
      address: "",
      phoneNumber: "",
      latitude: "",
      longitude: "",
    },
    confirmPassword: "", 
  });

  const handleChange = (section, field, value) => {
    if (section === "confirmPassword") {
      setFormData((prev) => ({ ...prev, confirmPassword: value }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }));
    }

    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[
        section === "confirmPassword" ? "confirmPassword" : `${section}.${field}`
      ];
      return newErrors;
    });
  };

  const handleMapChange = ({ latitude, longitude, address }) => {
    setFormData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        latitude,
        longitude,
        address: address || prev.profile.address,
      },
    }));
  };

  const validateForm = () => {
    const errors = {};
    const { username, password, email } = formData.user;
    const { phoneNumber } = formData.profile;
    const { confirmPassword } = formData;

    if (!/^[a-zA-Z0-9_]{4,20}$/.test(username)) {
      errors["user.username"] =
        "Tên đăng nhập chỉ chứa chữ, số, gạch dưới (4–20 ký tự)";
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(password)) {
      errors["user.password"] =
        "Mật khẩu tối thiểu 8 ký tự, gồm chữ và số";
    }

    if (password !== confirmPassword) {
      errors["confirmPassword"] = "Mật khẩu xác nhận không khớp";
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors["user.email"] = "Email không hợp lệ";
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      errors["profile.phoneNumber"] = "Số điện thoại phải gồm 10 chữ số";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    if (!formData.profile.latitude || !formData.profile.longitude) {
      toast.error("Vui lòng chọn địa chỉ trên bản đồ!");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        user: formData.user,
        profile: formData.profile,
      };

      const result = await userService.shopRegister(payload);

      if (result.success) {
        toast.success(result.message || "Đăng ký shop thành công!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(result.message || "Đăng ký thất bại.");
        if (result.errors) {
          const formatted = {};
          Object.entries(result.errors).forEach(([k, v]) => {
            formatted[k] = Array.isArray(v) ? v[0] : v;
          });
          setFieldErrors(formatted);
        }
      }
    } catch (err) {
      toast.error(err.message || "Lỗi kết nối máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden md:block md:w-1/2 bg-blue-50">
        <div className="sticky top-0 h-screen flex flex-col justify-end p-6">
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
            <img
              src={bgImg}
              alt="GHN Delivery"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-900/70 to-transparent p-8 text-white">
              <img src={logoImg} alt="Logo" className="w-40 mb-4" />
              <p className="text-lg font-medium mb-1">
                ĐĂNG KÝ SHOP – BẮT ĐẦU GIAO NHẬN NHANH HƠN
              </p>
              <p className="text-sm opacity-90">
                Tích hợp dễ dàng, quản lý đơn hàng thông minh
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Đăng ký tài khoản Shop
              </h1>
              <p className="text-sm text-gray-600">
                Nhập thông tin để bắt đầu sử dụng dịch vụ
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 p-5 rounded-lg space-y-4">
                <h3 className="font-medium text-gray-800">Thông tin đăng nhập</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1 text-gray-700">
                      Tên đăng nhập *
                    </label>
                    <input
                      type="text"
                      value={formData.user.username}
                      onChange={(e) => handleChange("user", "username", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="shop123"
                      required
                    />
                    {fieldErrors["user.username"] && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors["user.username"]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-1 text-gray-700">Mật khẩu *</label>
                    <div className="relative">
                      <input
                        type={"password"}
                        value={formData.user.password}
                        onChange={(e) => handleChange("user", "password", e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    {fieldErrors["user.password"] && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors["user.password"]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-1 text-gray-700">
                      Xác nhận mật khẩu *
                    </label>
                    <div className="relative">
                      <input
                        type={"password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleChange("confirmPassword", null, e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    {fieldErrors["confirmPassword"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors["confirmPassword"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-1 text-gray-700">Email *</label>
                    <input
                      type="email"
                      value={formData.user.email}
                      onChange={(e) => handleChange("user", "email", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="shop@example.com"
                      required
                    />
                    {fieldErrors["user.email"] && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors["user.email"]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-1 text-gray-700">Số điện thoại *</label>
                    <input
                      type="tel"
                      value={formData.profile.phoneNumber}
                      onChange={(e) => handleChange("profile", "phoneNumber", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="0901234567"
                      required
                    />
                    {fieldErrors["profile.phoneNumber"] && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors["profile.phoneNumber"]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-1 text-gray-700">Họ *</label>
                    <input
                      type="text"
                      value={formData.user.lastName}
                      onChange={(e) => handleChange("user", "lastName", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Nguyễn"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1 text-gray-700">Tên *</label>
                    <input
                      type="text"
                      value={formData.user.firstName}
                      onChange={(e) => handleChange("user", "firstName", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Văn A"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg space-y-4">
                <h3 className="font-medium text-gray-800">Địa chỉ cửa hàng</h3>

                <VietmapPicker
                  ref={mapRef}
                  latitude={formData.profile.latitude}
                  longitude={formData.profile.longitude}
                  address={formData.profile.address}
                  onChange={handleMapChange}
                  placeholder="Tìm kiếm địa chỉ..."
                />

                <div>
                  <label className="block text-sm mb-1 text-gray-700">
                    Địa chỉ chi tiết *
                  </label>
                  <input
                    type="text"
                    value={formData.profile.address}
                    onChange={(e) => handleChange("profile", "address", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Số nhà, tên đường..."
                    required
                  />
                  {fieldErrors["profile.address"] && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors["profile.address"]}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Quay lại Đăng nhập
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-8 py-3 font-medium rounded-md text-white ${
                    isLoading ? "bg-orange-400" : "bg-orange-500 hover:bg-orange-600 cursor-pointer"
                  }`}
                >
                  {isLoading ? "Đang xử lý..." : "Đăng ký Shop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopRegisterPage;
