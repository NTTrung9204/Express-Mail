import React, { useState } from "react";
import { toast } from "react-toastify";
import { resetPasswordService } from "../api/resetPasswordService";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Vui lòng nhập email");

    setIsLoading(true);
    try {
      await resetPasswordService.requestReset(email);
      toast.success("Mã OTP đã được gửi đến email của bạn");
      setStep(2);
    } catch (err) {
      toast.error("Không thể gửi OTP, vui lòng thử lại");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return toast.error("Vui lòng nhập đủ 6 chữ số OTP");

    setIsLoading(true);
    try {
      await resetPasswordService.verifyOTP(email, code);
      toast.success("Xác thực OTP thành công!");
      setStep(3);
    } catch (err) {
      toast.error("OTP không chính xác hoặc đã hết hạn");
      setOtp(["","","","","",""])
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const code = otp.join("");

    if (!newPassword || !confirmPassword)
      return toast.error("Vui lòng nhập đầy đủ mật khẩu");
    if (newPassword !== confirmPassword)
      return toast.error("Mật khẩu xác nhận không khớp");

    setIsLoading(true);
    try {
      await resetPasswordService.confirmReset(email, code, newPassword);
      toast.success("Đặt lại mật khẩu thành công!");
      navigate("/login");
    } catch (err) {
      toast.error("Không thể đặt lại mật khẩu, vui lòng thử lại");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center text-sm text-gray-500 hover:text-orange-500 mb-4 cursor-pointer"
        >
          <ArrowBack fontSize="small" className="mr-1" />
          Quay lại đăng nhập
        </button>

        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Quên mật khẩu
            </h2>
            <form onSubmit={handleSendEmail} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm mb-2 text-gray-700"
                >
                  Nhập email của bạn
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
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
                {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Nhập mã OTP
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Mã gồm 6 chữ số đã được gửi tới email{" "}
              <span className="font-medium text-gray-700">{email}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    maxLength={1}
                    className="w-12 h-12 text-center border border-gray-300 rounded-md text-lg font-medium outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ))}
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
                {isLoading ? "Đang xác thực..." : "Xác nhận OTP"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              Không nhận được mã?{" "}
              <button
                type="button"
                onClick={handleSendEmail}
                className="text-orange-500 hover:underline"
              >
                Gửi lại
              </button>
            </p>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Tạo mật khẩu mới
            </h2>
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm mb-2 text-gray-700"
                >
                  Mật khẩu mới
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm mb-2 text-gray-700"
                >
                  Xác nhận mật khẩu
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
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
                {isLoading ? "Đang xử lý..." : "Xác nhận mật khẩu mới"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
