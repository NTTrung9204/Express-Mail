import React, { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import logoImg from '../assets/logo.png';
import warehouse_worker from '../assets/ghn_img-login.jpg';
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/post-office/home');
  }

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

          <form className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Mã nhân viên
              </label>
              <input
                type="text"
                placeholder="Nhập tên đăng nhập"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-gray-700 font-medium">Mật khẩu</label>
                <a href="#" className="text-sm text-orange-500 hover:underline">
                  Quên mật khẩu?
                </a>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              className="w-full bg-orange-400 hover:bg-orange-500 text-white font-semibold rounded-lg py-2 transition"
            >
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
