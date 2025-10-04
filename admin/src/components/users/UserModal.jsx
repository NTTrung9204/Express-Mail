import React, { useState, useEffect } from "react";

const UserModal= ({ open, onClose, mode = "add", user = {}, onSave }) => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    cardId: "",
    status: "active",
    permissions: [],
  });

  useEffect(() => {
    if (mode !== "add" && user) setForm(user);
  }, [mode, user]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePerm = (p) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions?.includes(p)
        ? prev.permissions.filter((x) => x !== p)
        : [...(prev.permissions || []), p],
    }));
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const isView = mode === "view";

  const perms = [
    "Quản lý người dùng",
    "Quản lý kho hàng",
    "Xem báo cáo",
    "Quản lý đơn hàng",
    "Quản lý cài đặt",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="
          bg-orange-50 w-full max-w-4xl p-8 rounded-xl shadow-xl
        "
      >
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {mode === "add"
              ? "Thêm Người dùng"
              : mode === "edit"
              ? "Sửa Người dùng"
              : "Xem Người dùng"}
          </h2>
          <button onClick={onClose} className="text-4xl leading-none cursor-pointer hover:text-orange-600">×</button>
        </div>

        <div className="grid grid-cols-2 gap-6">

          <div>
            <label className="block mb-1 font-medium">Tên đăng nhập</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              disabled={isView}
              placeholder="Nhập tên đăng nhập"
              className="w-full p-2 border rounded focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Mật khẩu</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              disabled={isView}
              placeholder="Nhập mật khẩu"
              className="w-full p-2 border rounded focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={isView}
              placeholder="Nhập email"
              className="w-full p-2 border rounded focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Số điện thoại</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              disabled={isView}
              placeholder="Nhập số điện thoại"
              className="w-full p-2 border rounded focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Mã thẻ</label>
            <input
              name="cardId"
              value={form.cardId}
              onChange={handleChange}
              disabled={isView}
              placeholder=""
              className="w-full p-2 border rounded focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Trạng thái</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={isView}
              className="w-full p-2 border rounded focus:border-orange-500 outline-none"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <p className="font-medium mb-2">Quyền hạn</p>
          <div className="grid grid-cols-2 gap-2">
            {perms.map((p) => (
              <label key={p} className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  checked={form.permissions?.includes(p)}
                  onChange={() => togglePerm(p)}
                  disabled={isView}
                  className="w-5 h-5 border-2 border-gray-400 rounded checked:bg-orange-500 checked:border-orange-500 focus:ring-2 focus:ring-orange-300"
                />
                {p}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
          >
            Hủy
          </button>
          {!isView && (
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 cursor-pointer"
            >
              {mode === "edit" ? "Cập nhật" : "Thêm mới"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserModal;
