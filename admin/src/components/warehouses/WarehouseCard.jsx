import React from "react";
import { PersonAdd, Edit, Delete } from "@mui/icons-material";

const WarehouseCard = ({ name, address, status, onAddUser, onEdit, onDelete }) => {
  return (
    <div className="bg-white shadow-md rounded-2xl p-5 flex flex-col justify-between hover:shadow-xl transition">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">{name}</h2>
        <p className="text-sm text-gray-500 mt-1">{address}</p>

        <span
          className={`inline-block mt-3 px-3 py-1 text-xs rounded-full ${
            status === "Hoạt động"
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="flex gap-3 mt-5">
        <button
          onClick={onAddUser}
          className="flex-1 border border-orange-400 text-orange-600 px-3 py-2 rounded hover:bg-orange-50 flex items-center justify-center gap-1 cursor-pointer"
        >
          <PersonAdd fontSize="small" /> Thêm User
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

export default WarehouseCard;
