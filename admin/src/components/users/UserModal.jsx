import React, { useState, useEffect } from "react";
import {
  fetchProvinces,
  fetchDistricts,
  fetchWards,
} from "../../api/locationService";

const UserModal = ({ open, onClose, mode = "add", user = {}, onSave }) => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phone: "",
    cardId: "",
    status: "active",
    role: "",
    province: "",
    district: "",
    ward: "",
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const isView = mode === "view";

  useEffect(() => {
    if (mode !== "add" && user) setForm(user);
    fetchProvincesData();
  }, [mode, user]);

  const fetchProvincesData = async () => {
    try {
      const data = await fetchProvinces();
      setProvinces(data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchDistrictsData = async (provinceCode) => {
    try {
      const data = await fetchDistricts(provinceCode);
      setDistricts(data);
      setWards([]);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchWardsData = async (districtCode) => {
    try {
      const data = await fetchWards(districtCode);
      setWards(data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "province") {
      fetchDistrictsData(value);
      setForm((prev) => ({ ...prev, district: "", ward: "" }));
    }
    if (name === "district") {
      fetchWardsData(value);
      setForm((prev) => ({ ...prev, ward: "" }));
    }
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white w-full max-w-4xl p-8 rounded-2xl shadow-2xl" onClick={(e)=>e.stopPropagation()}>
        <div className="flex justify-between mb-6 border-b pb-3">
          <h2 className="text-2xl font-semibold text-orange-600">
            {mode === "add"
              ? "Thêm người dùng"
              : mode === "edit"
              ? "Sửa thông tin người dùng"
              : "Thông tin người dùng"}
          </h2>
          <button
            onClick={onClose}
            className="text-4xl leading-none hover:text-orange-600 cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-1 font-medium">Họ và tên</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              disabled={isView}
              placeholder="Nhập họ và tên"
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
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
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-1 font-medium">Địa chỉ</label>
          <div className="grid grid-cols-3 gap-4">
            <select
              name="province"
              value={form.province}
              onChange={handleChange}
              disabled={isView}
              className="p-2 border rounded-lg focus:border-orange-500 outline-none"
            >
              <option value="">Chọn Tỉnh / Thành</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              name="district"
              value={form.district}
              onChange={handleChange}
              disabled={isView || !form.province}
              className="p-2 border rounded-lg focus:border-orange-500 outline-none"
            >
              <option value="">Chọn Quận / Huyện</option>
              {districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              name="ward"
              value={form.ward}
              onChange={handleChange}
              disabled={isView || !form.district}
              className="p-2 border rounded-lg focus:border-orange-500 outline-none"
            >
              <option value="">Chọn Phường / Xã</option>
              {wards.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </select>

          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-1 font-medium">Tên đăng nhập</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              disabled={isView}
              placeholder="Nhập tên đăng nhập"
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
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
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={isView}
              placeholder="Nhập email"
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Mã thẻ</label>
            <input
              name="cardId"
              value={form.cardId}
              onChange={handleChange}
              disabled={isView}
              placeholder="Nhập mã thẻ"
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium">Trạng thái</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={isView}
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Vai trò</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              disabled={isView}
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
            >
              <option value="">Chọn vai trò</option>
              <option value="staff">Nhân viên kho</option>
              <option value="shipper">Shipper</option>
              <option value="shopOwner">Chủ shop</option>
              <option value="warehouseOwner">Chủ kho</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
          >
            Hủy
          </button>
          {!isView && (
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer"
            >
              {mode === "edit" ? "Cập nhật" : "Thêm mới"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserModal;
