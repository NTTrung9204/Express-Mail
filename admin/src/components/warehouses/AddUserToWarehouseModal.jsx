import React, { useState } from "react";
import { PersonAddAlt1 } from "@mui/icons-material";

const AddUserToWarehouseModal = ({ open, onClose, warehouse, users = [], onSubmit }) => {
  const [selectedUser, setSelectedUser] = useState("");

  if (!open) return null;

  const handleAdd = () => {
    if (!selectedUser) return;
    onSubmit(selectedUser);
    setSelectedUser("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-orange-50 w-full max-w-md p-6 rounded-xl shadow-xl relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <PersonAddAlt1 fontSize="small" />
            Thêm người dùng vào kho
          </h2>
          <button
            onClick={onClose}
            className="text-4xl leading-none hover:text-orange-600 cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Kho được chọn:</p>
          <div className="bg-white border rounded p-3 mt-1">
            <p className="font-semibold text-gray-800">{warehouse?.name}</p>
            <p className="text-gray-500 text-sm">{warehouse?.address}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chọn người dùng
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">Chọn người dùng để thêm vào kho</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username} ({u.email})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
          >
            Hủy
          </button>
          <button
            disabled={!selectedUser}
            onClick={handleAdd}
            className={`px-4 py-2 rounded flex items-center gap-1
              ${selectedUser ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer" : "bg-orange-200 text-gray-400 cursor-not-allowed"}
            `}
          >
            <PersonAddAlt1 fontSize="small" />
            Thêm vào kho
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserToWarehouseModal;
