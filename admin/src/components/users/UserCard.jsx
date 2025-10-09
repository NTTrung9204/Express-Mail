import React from "react";
import { Visibility, Edit, Delete } from "@mui/icons-material";

const UserCard = ({ username, email, phone, cardId, status, onView, onEdit, onDelete }) => {
  const isActive = status === "active";

  return (
    <div className="bg-white shadow-md rounded-2xl p-5 flex flex-col justify-between hover:shadow-xl transition">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 capitalize">
          {username}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Email: <span className="font-medium text-gray-700">{email}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          SĐT: <span className="font-medium text-gray-700">{phone}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Mã thẻ: <span className="font-medium text-gray-700">{cardId || "—"}</span>
        </p>

        <span
          className={`inline-block mt-3 px-3 py-1 text-xs rounded-full ${
            isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {isActive ? "Hoạt động" : "Ngừng hoạt động"}
        </span>
      </div>

      <div className="flex gap-3 mt-5">
        <button
          onClick={onView}
          className="flex-1 border border-orange-400 text-orange-600 px-3 py-2 rounded hover:bg-orange-50 flex items-center justify-center gap-1 cursor-pointer"
        >
          <Visibility fontSize="small" /> Xem
        </button>
        <button
          onClick={onEdit}
          className="flex-1 border border-orange-400 text-orange-600 px-3 py-2 rounded hover:bg-orange-50 flex items-center justify-center gap-1 cursor-pointer"
        >
          <Edit fontSize="small" /> Sửa
        </button>
        <button
          onClick={onDelete}
          className="border border-red-400 text-red-500 px-3 py-2 rounded hover:bg-red-50 flex items-center justify-center cursor-pointer"
        >
          <Delete fontSize="small" />
        </button>
      </div>
    </div>
  );
};

export default UserCard;
