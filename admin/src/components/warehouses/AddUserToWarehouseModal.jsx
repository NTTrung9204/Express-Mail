import React, { useState } from "react";
import { PersonAddAlt1, Search } from "@mui/icons-material";

const AddUserToWarehouseModal = ({ open, onClose, warehouse, users = [], onSubmit }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  if (!open) return null;

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (user) => {
    setSelectedUser(user);
    setSearchTerm(`${user.username} (${user.email})`);
  };

  const handleAdd = () => {
    if (!selectedUser) return;
    onSubmit(selectedUser.id);
    setSelectedUser(null);
    setSearchTerm("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-orange-50 w-full max-w-md p-6 rounded-xl shadow-xl relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-orange-600">
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
          <div className="bg-white border border-orange-200 rounded p-3 mt-1">
            <p className="font-semibold text-gray-800">{warehouse?.name}</p>
            <p className="text-gray-500 text-sm">{warehouse?.address}</p>
          </div>
        </div>

        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chọn người dùng
          </label>
          <div className="flex items-center bg-white border border-orange-200 rounded px-3 py-2 focus-within:ring-2 focus-within:ring-orange-400">
            <Search className="text-gray-400 mr-2" fontSize="small" />
            <input
              type="text"
              placeholder="Nhập tên hoặc email người dùng..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedUser(null);
              }}
              className="w-full outline-none text-gray-800"
            />
          </div>

          {searchTerm && !selectedUser && filteredUsers.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-orange-200 rounded shadow-lg max-h-40 overflow-y-auto">
              {filteredUsers.map((u) => (
                <li
                  key={u.id}
                  onClick={() => handleSelect(u)}
                  className="px-3 py-2 hover:bg-orange-100 cursor-pointer text-sm text-gray-800"
                >
                  {u.username} <span className="text-gray-500">({u.email})</span>
                </li>
              ))}
            </ul>
          )}
          {searchTerm && filteredUsers.length === 0 && !selectedUser && (
            <p className="text-sm text-gray-500 mt-1">Không tìm thấy người dùng.</p>
          )}
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
            className={`px-4 py-2 rounded flex items-center gap-1 transition
              ${
                selectedUser
                  ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                  : "bg-orange-200 text-gray-400 cursor-not-allowed"
              }`}
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
