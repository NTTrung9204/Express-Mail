import React, { useState } from "react";
import {
  PersonOff,
  PersonAddAlt1,
  Close,
  Search,
} from "@mui/icons-material";
import ConfirmModal from "../components/shippers/ConfirmModal";

const Shippers = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ type: "", name: "" });

  const activeShippers = [
    { name: "Nguyễn Văn A", email: "shipper1@example.com", phone: "0901234567", status: "Hoạt động" },
    { name: "Trần Văn B", email: "shipper2@example.com", phone: "0902234567", status: "Hoạt động" },
    { name: "Lê Thị C", email: "shipper3@example.com", phone: "0903234567", status: "Vô hiệu" },
  ];

  const pendingRequests = [
    { name: "Phạm Văn D", email: "newshipper1@example.com", phone: "0904234567", date: "2024-03-15" },
    { name: "Hoàng Thị E", email: "newshipper2@example.com", phone: "0905234567", date: "2024-03-16" },
  ];

  const openModal = (type, name) => {
    setModalContent({ type, name });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleConfirm = () => {
    console.log(`✅ ${modalContent.type} cho ${modalContent.name}`);
    setModalOpen(false);
  };

  const renderModalMessage = () => {
    switch (modalContent.type) {
      case "disable":
        return `Bạn có chắc muốn vô hiệu hóa tài khoản của ${modalContent.name}?`;
      case "approve":
        return `Xác nhận phê duyệt yêu cầu của ${modalContent.name}?`;
      case "reject":
        return `Bạn có chắc muốn từ chối yêu cầu của ${modalContent.name}?`;
      default:
        return "";
    }
  };

  return (
    <div className="bg-[#fff8f5] min-h-screen text-[#4b1d09]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#4b1d09]">Quản lý Shipper</h1>
        <p className="text-base text-[#7a4a32] mt-1">
          Quản lý tài khoản và yêu cầu shipper
        </p>
      </div>

      <div className="bg-white shadow-md rounded-xl p-5 mb-6 border border-orange-100">
        <h2 className="text-lg font-semibold text-[#4b1d09] mb-4">
          Danh sách tài khoản Shipper
        </h2>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="w-full border border-orange-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>

        <table className="w-full text-sm border-separate border-spacing-y-1">
          <thead>
            <tr className="text-left border-b border-orange-100 text-[#4b1d09]">
              <th className="py-2 px-4 w-[20%]">Tên</th>
              <th className="py-2 px-4 w-[25%]">Email</th>
              <th className="py-2 px-4 w-[20%]">Số điện thoại</th>
              <th className="py-2 px-4 w-[15%]">Trạng thái</th>
              <th className="py-2 px-4 w-[20%] text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {activeShippers.map((shipper, index) => (
              <tr
                key={index}
                className="border-b border-orange-50 hover:bg-orange-50 transition-colors"
              >
                <td className="py-3 px-4">{shipper.name}</td>
                <td className="px-4">{shipper.email}</td>
                <td className="px-4">{shipper.phone}</td>
                <td className="px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      shipper.status === "Hoạt động"
                        ? "bg-orange-500 text-white"
                        : "bg-orange-100 text-orange-500"
                    }`}
                  >
                    {shipper.status}
                  </span>
                </td>
                <td className="px-4 text-right">
                  <button
                    onClick={() => openModal("disable", shipper.name)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md text-white text-xs justify-end float-right ${
                      shipper.status === "Hoạt động"
                        ? "bg-red-500 hover:bg-red-600 cursor-pointer"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={shipper.status !== "Hoạt động"}
                  >
                    <PersonOff fontSize="small" /> Vô hiệu hóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white shadow-md rounded-xl p-5 border border-orange-100">
        <h2 className="text-lg font-semibold text-[#4b1d09] mb-4">
          Yêu cầu tạo tài khoản Shipper
        </h2>

        <div className="space-y-4">
          {pendingRequests.map((req, index) => (
            <div
              key={index}
              className="border border-orange-100 rounded-xl p-4 hover:shadow-sm transition-all flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-[#4b1d09]">{req.name}</p>
                <p className="text-sm text-gray-600">{req.email}</p>
                <p className="text-sm text-gray-600">SDT: {req.phone}</p>
                <p className="text-xs text-gray-500">Ngày yêu cầu: {req.date}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => openModal("approve", req.name)}
                  className="flex items-center gap-1 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-xs font-medium transition-all cursor-pointer"
                >
                  <PersonAddAlt1 fontSize="small" /> Phê duyệt
                </button>
                <button
                  onClick={() => openModal("reject", req.name)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-medium transition-all cursor-pointer"
                >
                  <Close fontSize="small" /> Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        open={modalOpen}
        title="Xác nhận hành động"
        message={renderModalMessage()}
        onCancel={closeModal}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default Shippers;
