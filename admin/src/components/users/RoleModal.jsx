import React from "react";

const RoleModal = ({ role, onClose }) => {
  const roleNameMap = {
    staff: "Nhân viên kho",
    shipper: "Shipper",
    shopOwner: "Chủ shop",
    warehouseOwner: "Chủ kho",
  };

  const infoMap = {
    staff: "Nhân viên kho chịu trách nhiệm quản lý hàng hóa và kiểm kê.",
    shipper: "Shipper đảm nhận giao hàng tới khách hàng.",
    shopOwner: "Chủ shop quản lý đơn hàng và sản phẩm trong cửa hàng.",
    warehouseOwner: "Chủ kho chịu trách nhiệm tổng quản kho và nhân sự kho.",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" onClick={(e)=>e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Vai trò: {roleNameMap[role]}
          </h2>
          <button onClick={onClose} className="text-3xl leading-none hover:text-orange-500 cursor-pointer">×</button>
        </div>

        <p className="text-gray-700">{infoMap[role]}</p>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleModal;
