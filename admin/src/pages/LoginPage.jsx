import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { authService } from "../api/authService";
import logoImg from '../assets/logo.png';
import warehouse_worker from '../assets/ghn_img-login.jpg';
import { toast } from "react-toastify";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",  
    password: ""   
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    setError("");
    setIsLoading(true);

    if (!formData.username || !formData.password) {
      setError("Please enter both username and password");
      setIsLoading(false);
      return;
    }

    try {
      const res = await authService.login({
        username: formData.username,
        password: formData.password,
      });
      console.log("Login success:", res);
      navigate("/admin/home");
      toast.success("Đăng nhập thành công");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex bg-white rounded-2xl shadow-md p-8 w-[850px] max-w-[95%]">
        <div className="w-1/2 flex items-center justify-center md:flex">
          <img
            src={warehouse_worker}
            alt="Warehouse Worker"
            className="w-[320px] object-contain"
          />
        </div>

        <div className="md:w-1/2 w-full flex flex-col justify-center px-6">
          <div className="flex items-center justify-center mb-6">
            <img
              src={logoImg}
              alt="GHN Logo"
              className="w-40"
            />
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-600 rounded text-sm text-center">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Tài khoản
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Nhập tên đăng nhập"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                required
                tabIndex={1}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-gray-700 font-medium">Mật khẩu</label>
                <a href="#" className="text-sm text-orange-500 hover:underline" tabIndex={-1}>
                  Quên mật khẩu?
                </a>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 pr-10"
                  required
                  tabIndex={2}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-orange-400 hover:bg-orange-500 text-white font-semibold rounded-lg py-2 transition cursor-pointer ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}