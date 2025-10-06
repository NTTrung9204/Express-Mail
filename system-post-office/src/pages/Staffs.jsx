import React, { useState } from "react";
import { toast } from "react-toastify";
import { PersonOff, Add, Search } from "@mui/icons-material";
import ConfirmModal from "../components/staffs/ConfirmModal";

const Staffs = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });

  const employees = [
    { name: "Nguyễn Văn A", email: "staff1@example.com", role: "Nhân viên kho", status: "Hoạt động" },
    { name: "Trần Thị B", email: "staff2@example.com", role: "Nhân viên giao nhận", status: "Hoạt động" },
    { name: "Lê Văn C", email: "staff3@example.com", role: "Quản lý ca", status: "Vô hiệu" },
  ];

  const handleDisable = (name) => {
    setModalContent({
      title: "Xác nhận vô hiệu hóa",
      message: `Bạn có chắc chắn muốn vô hiệu hóa tài khoản của ${name} không?`,
    });
    setShowModal(true);
  };

  const confirmAction = () => {
    setShowModal(false);
    toast.success("Tài khoản đã được vô hiệu hóa!");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormValid =
    formData.name && formData.email && formData.role && formData.password;

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Tạo tài khoản nhân viên thành công!");
    setFormData({ name: "", email: "", role: "", password: "" });
  };

  return (
    <div className="bg-[#fff8f5] min-h-screen text-[#4b1d09]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#4b1d09]">Quản lý Nhân viên</h1>
        <p className="text-base text-[#7a4a32] mt-1">
          Quản lý tài khoản nhân viên trong hệ thống
        </p>
      </div>

      <div className="bg-white shadow-md rounded-xl p-5 mb-6 border border-orange-100">
        <h2 className="text-lg font-semibold text-[#4b1d09] mb-4">
          Danh sách tài khoản Nhân viên
        </h2>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="w-full border border-orange-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-orange-100 text-[#4b1d09]">
              <th className="py-2 w-1/5">Tên</th>
              <th className="py-2 w-1/5">Email</th>
              <th className="py-2 w-1/5">Vai trò</th>
              <th className="py-2 w-1/5">Trạng thái</th>
              <th className="py-2 w-1/5 text-right pr-4">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, index) => (
              <tr
                key={index}
                className="border-b border-orange-50 hover:bg-orange-50 transition-colors"
              >
                <td className="py-3">{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.role}</td>
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      emp.status === "Hoạt động"
                        ? "bg-orange-500 text-white"
                        : "bg-orange-100 text-orange-500"
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>
                <td className="text-right pr-4">
                  <button
                    onClick={() => handleDisable(emp.name)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md text-white text-xs ml-auto transition ${
                      emp.status === "Hoạt động"
                        ? "bg-red-500 hover:bg-red-600 cursor-pointer"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={emp.status !== "Hoạt động"}
                  >
                    <PersonOff fontSize="small" /> Vô hiệu hóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-xl p-5 border border-orange-100"
      >
        <h2 className="text-lg font-semibold text-[#4b1d09] mb-4">
          Tạo tài khoản Nhân viên
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Họ và tên</label>
            <input
              name="name"
              type="text"
              placeholder="Nhập họ và tên"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Nhập email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Vai trò</label>
            <select
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
            >
              <option value="">Chọn vai trò</option>
              <option>Nhân viên kho</option>
              <option>Nhân viên giao nhận</option>
              <option>Quản lý ca</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Mật khẩu</label>
            <input
              name="password"
              type="password"
              placeholder="Nhập mật khẩu"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <button
            type="submit"
            disabled={!isFormValid}
            className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              isFormValid
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Add fontSize="small" /> Tạo tài khoản
          </button>
        </div>
      </form>

      <ConfirmModal
        isOpen={showModal}
        title={modalContent.title}
        message={modalContent.message}
        onConfirm={confirmAction}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
};

export default Staffs;
