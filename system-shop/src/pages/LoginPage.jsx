import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast} from 'react-toastify';

import bgImg from '../assets/ghn.png';
import logoImg from '../assets/logo.png';
import appStoreImg from '../assets/appstore.png';
import chPlayImg from '../assets/chplay.png';


const LoginPage = () => {
  const validPhones = ["0901234567", "0987654321"];

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleContinue = () => {
    if (validPhones.includes(phone.trim())) {
      setShowPassword(true);
    } else {
      toast.error('Số điện thoại không tồn tại');
    }
  };

  const handleLogin = () => {
    toast.success('Đăng nhập thành công')
    navigate('/order-delivery');
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

          <label htmlFor="phone" className="block text-sm mb-2 text-gray-700">
            Nhập SĐT để đăng nhập hoặc đăng ký
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="Nhập số điện thoại của bạn"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-6"
          />

          {!showPassword && (
            <button
              onClick={handleContinue}
              disabled={!phone}
              className={`w-full font-medium py-3 rounded-md mb-6 ${
                phone
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Tiếp tục
            </button>
          )}

          {showPassword && (
            <>
              <label htmlFor="password" className="block text-sm mb-2 text-gray-700">
                Nhập mật khẩu
              </label>
              <input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-6"
              />
              <button
                onClick={handleLogin}
                disabled={!password}
                className={`w-full font-medium py-3 rounded-md mb-6 ${
                  password
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Đăng nhập
              </button>
            </>
          )}

          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-3 text-sm text-gray-500">
              Dành riêng cho nhân viên GHN
            </span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <button className="w-full border border-orange-500 text-orange-500 py-3 rounded-md font-medium hover:bg-orange-50">
            Đăng nhập nội bộ GHN
          </button>

          <div className="flex justify-center mt-8 space-x-4">
            <a href="#">
              <img src={appStoreImg} alt="App Store" className="h-10" />
            </a>
            <a href="#">
              <img src={chPlayImg} alt="Google Play" className="h-10" />
            </a>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            © 2025 Bản quyền thuộc về Giao Hàng Nhanh
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage