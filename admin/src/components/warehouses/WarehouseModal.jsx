import React, { useEffect, useState, useRef } from "react";
import { useWarehouseStore } from "../../store/warehouseStore";
import { toast } from "react-toastify";
import VietmapPicker from "../common/VietmapPicker";

const WarehouseModal = ({ open, onClose, mode = "add", warehouse = {}, onSubmit }) => {
  const isView = mode === "view";
  const disabledBg = "bg-white";
  const defaultClass = "w-full p-2 border rounded focus:outline-none";
  const disabledClass = `${defaultClass} ${disabledBg}`;
  const enabledClass = `${defaultClass} focus:border-orange-500`;

  const {
    warehouses,
    provinces,
    districts,
    wards,
    setSelectedProvince,
    setSelectedDistrict,
  } = useWarehouseStore();

  const [form, setForm] = useState({
    name: "",
    address: "",
    provinceCity: "",
    district: "",
    wardCommune: "",
    latitude: "",
    longitude: "",
  });

  const mapPickerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    if (mode === "add") {
      setForm({
        name: "",
        address: "",
        provinceCity: "",
        district: "",
        wardCommune: "",
        latitude: "",
        longitude: "",
      });
      setSelectedProvince("");
      setSelectedDistrict("");
    } else if (warehouse) {
      setForm({
        name: warehouse.name || "",
        address: warehouse.address || "",
        provinceCity: warehouse.provinceCity || "",
        district: warehouse.district || "",
        wardCommune: warehouse.wardCommune || "",
        latitude: warehouse.latitude || "",
        longitude: warehouse.longitude || "",
      });
      setSelectedProvince(warehouse.provinceCity || "");
      setSelectedDistrict(warehouse.district || "");
    }
  }, [open, mode, warehouse, setSelectedProvince, setSelectedDistrict]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "provinceCity") {
      setSelectedProvince(value);
      setForm((prev) => ({ ...prev, district: "", wardCommune: "" }));
    } else if (name === "district") {
      setSelectedDistrict(value);
      setForm((prev) => ({ ...prev, wardCommune: "" }));
    }
  };

  const handleMapChange = ({ latitude, longitude, address }) => {
    setForm((prev) => ({
      ...prev,
      latitude,
      longitude,
      address: address || prev.address,
    }));
  };

  const handleSave = async () => {
    const { name, address, provinceCity, district, wardCommune, latitude, longitude } = form;
    if (!name || !address || !provinceCity || !district || !wardCommune || !latitude || !longitude) {
      toast.warn("Vui lòng nhập đầy đủ thông tin và chọn tọa độ trên bản đồ!");
      return;
    }

    const result = await onSubmit(form);
    if (result?.success) {
      toast.success(result.message);
      onClose();
    } else {
      toast.error(result?.message || "Không thể lưu kho. Vui lòng thử lại!");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-3xl p-6 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-orange-700">
            {mode === "add"
              ? "Thêm Kho Mới"
              : mode === "edit"
              ? "Chỉnh Sửa Kho"
              : "Xem Chi Tiết Kho"}
          </h2>
          <button
            onClick={onClose}
            className="text-3xl text-orange-600 hover:text-orange-800 transition cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tên kho *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={isView}
              placeholder="VD: Kho Hà Nội 1"
              className={isView ? disabledClass : enabledClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tỉnh / Thành phố *
              </label>
              <select
                name="provinceCity"
                value={form.provinceCity}
                onChange={handleChange}
                disabled={isView}
                className={isView ? disabledClass : enabledClass}
              >
                <option value="">Chọn tỉnh/thành phố</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Quận / Huyện *
              </label>
              <select
                name="district"
                value={form.district}
                onChange={handleChange}
                disabled={isView || !form.provinceCity}
                className={isView ? disabledClass : enabledClass}
              >
                <option value="">Chọn quận/huyện</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Phường / Xã *
              </label>
              <select
                name="wardCommune"
                value={form.wardCommune}
                onChange={handleChange}
                disabled={isView || !form.district}
                className={isView ? disabledClass : enabledClass}
              >
                <option value="">Chọn phường/xã</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Địa chỉ cụ thể *{" "}
              {!isView && (
                <span className="text-xs font-normal text-gray-500 ml-2">
                  (Chọn từ bản đồ bên dưới)
                </span>
              )}
            </label>
            <input
              name="address"
              value={form.address}
              readOnly
              disabled={isView}
              placeholder="Địa chỉ sẽ được cập nhật từ bản đồ..."
              className={`${isView ? disabledClass : enabledClass} ${
                !isView ? "cursor-not-allowed" : ""
              }`}
              title="Địa chỉ này được cập nhật tự động khi bạn tìm kiếm trên bản đồ"
            />
          </div>

          {!isView && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tìm kiếm và chọn vị trí trên bản đồ *
              </label>

              <VietmapPicker
                ref={mapPickerRef}
                latitude={form.latitude}
                longitude={form.longitude}
                address={form.address}
                postOffices={warehouses}
                onChange={handleMapChange}
                disabled={isView}
                hideSearch={isView}
                placeholder="Tìm kiếm địa điểm (VD: Vincom, Times City, Hồ Hoàn Kiếm...)"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition cursor-pointer font-medium"
          >
            {isView ? "Đóng" : "Hủy"}
          </button>
          {!isView && (
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition cursor-pointer font-medium shadow-md"
            >
              {mode === "edit" ? "Cập nhật" : "Thêm mới"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarehouseModal;
