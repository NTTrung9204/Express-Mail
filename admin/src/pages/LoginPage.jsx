import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../api/authService";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import bgImg from "../assets/ghn.png";
import logoImg from "../assets/logo.png";


const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.username || !formData.password) {
      toast.error("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login({
        username: formData.username,
        password: formData.password,
      });

      const { user } = res;
      toast.success("Đăng nhập thành công");

      if (user.role === "superadmin" || user.role === "admin") {
        navigate("/home");
      } else if (user.role === "post_office_manager" || user.role === "post_office_staff") {
          window.location.href = "http://localhost:3000/post-office/home";
      } else if (user.role === "shop") {
          window.location.href = "http://localhost:3000/shop";
      }
    } catch (err) {
      console.error("Login failed:", err);
      toast.error("Tên đăng nhập hoặc mật khẩu không chính xác");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden md:flex md:w-1/2 bg-blue-50 justify-center items-center p-6">
        <div className="relative w-full h-full flex flex-col justify-end rounded-2xl overflow-hidden">
          <img
            src={bgImg}
            alt="GHN Delivery"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative bg-gradient-to-t from-blue-900/60 to-transparent p-8 text-white">
            <img src={logoImg} alt="GHN Logo" className="w-40 mb-4" />
            <p className="text-lg font-medium mb-1">
              THIẾT KẾ CHO GIẢI PHÁP GIAO NHẬN HÀNG TỐI ƯU HƠN
            </p>
            <p className="text-sm opacity-90">
              Nhanh hơn, rẻ hơn và thông minh hơn
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Chào mừng bạn đến với
          </h1>
          <h2 className="text-2xl font-bold text-orange-600 mb-8">
            Giao Hàng Nhanh
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm mb-2 text-gray-700"
              >
                Tên người dùng
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm text-gray-700"
                >
                  Mật khẩu
                </label>
                <a
                  href="/admin/reset-password"
                  className="text-sm text-orange-500 hover:underline"
                  tabIndex={-1}
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-medium py-3 rounded-md transition ${
                isLoading
                  ? "bg-orange-400/70 cursor-not-allowed text-white"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </button>

            <p className="text-center text-sm text-gray-600 mt-3">
              Bạn là chủ shop?{" "}
              <button
                type="button"
                onClick={() => navigate("/shop-register")}
                className="font-medium text-orange-500 hover:underline cursor-pointer"
              >
                Đăng ký ngay
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
