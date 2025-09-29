import React, { useState } from "react";
import UserCard from "../components/users/UserCard";
import SearchBar from "../components/users/SearchBar";
import UserModal from "../components/users/UserModal";
import { Add } from "@mui/icons-material";

const initialUsers = [
  { id: 1, name: "Nguyễn Văn An", email: "an@example.com", role: "Admin", status: "active", permissions: [] },
  { id: 2, name: "Trần Thị Bình", email: "binh@example.com", role: "User", status: "active", permissions: [] },
  { id: 3, name: "Lê Văn Cường", email: "cuong@example.com", role: "Manager", status: "inactive", permissions: [] },
  { id: 4, name: "Phạm Thị Dung", email: "dung@example.com", role: "User", status: "active", permissions: [] },
  
];

const Users = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(initialUsers);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [selected, setSelected] = useState(null);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = (m, user = null) => {
    setMode(m);
    setSelected(user);
    setOpen(true);
  };

  const handleSave = (data) => {
    if (mode === "add") {
      setUsers((prev) => [...prev, { ...data, id: Date.now() }]);
    } else if (mode === "edit") {
      setUsers((prev) => prev.map((u) => (u.id === selected.id ? { ...u, ...data } : u)));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold"> Chào mừng đến trang Quản lý người dùng</h1>
        <button
          onClick={() => handleOpen("add")}
          className="flex items-center gap-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 cursor-pointer"
        >
          <Add fontSize="small" /> Thêm Người dùng
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((user) => (
          <UserCard
            key={user.id}
            {...user}
            onView={() => handleOpen("view", user)}
            onEdit={() => handleOpen("edit", user)}
            onDelete={() => setUsers((prev) => prev.filter((u) => u.id !== user.id))}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-gray-500">Không tìm thấy người dùng</div>
        )}
      </div>

      <UserModal
        open={open}
        onClose={() => setOpen(false)}
        mode={mode}
        user={selected}
        onSave={handleSave}
      />
    </div>
  );
};

export default Users;
