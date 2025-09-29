import React from "react";
import { Visibility, Edit, Delete } from "@mui/icons-material";

const UserCard = ({ name, email, role, status, onView, onEdit, onDelete }) => {
  const isActive = status === "active";
  return (
    <div className="bg-white shadow rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{name}</h3>
            <div className="flex items-center justify-between">
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isActive ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-600"
                    }`}
                    >
                    {isActive ? "Hoạt động" : "Ngừng hoạt động"}
                </span>
            </div>   
        </div>
        <p className="text-gray-600">Email<br/><span className="font-medium">{email}</span></p>
        <p className="text-gray-600 mt-1">Vai trò<br/><span className="font-medium">{role}</span></p>
      </div>

      <div className="flex gap-3 mt-4 justify-center">
        <button
          onClick={onView}
          className="flex items-center gap-1 px-8 py-1 border rounded-lg hover:bg-gray-50 text-gray-700 cursor-pointer"
        >
          <Visibility fontSize="small" /> Xem
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 px-8 py-1 border rounded-lg hover:bg-gray-50 text-gray-700 cursor-pointer"
        >
          <Edit fontSize="small" /> Sửa
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1 px-8 py-1 border rounded-lg hover:bg-red-50 text-red-600 cursor-pointer"
        >
          <Delete fontSize="small" /> Xoá
        </button>
      </div>
    </div>
  );
};

export default UserCard;
