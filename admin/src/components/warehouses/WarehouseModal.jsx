import React, { useEffect, useState, useRef } from "react";
import { useWarehouseStore } from "../../store/warehouseStore";
import { toast } from "react-toastify";
import VietmapPicker from "../common/VietmapPicker";

const WarehouseModal = ({ open, onClose, mode = "add", warehouse = {}, onSubmit }) => {
  const isView = mode === "view";
  const disabledBg = "bg-orange-100";
  const defaultClass = "w-full p-2 border rounded focus:outline-none";
  const disabledClass = `${defaultClass} ${disabledBg}`;
  const enabledClass = `${defaultClass} focus:border-orange-500`;

  const {
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

  useEffect(() => {
    if (isView || !form.provinceCity || !form.district || !form.wardCommune) return;

    const province = provinces.find(p => p.code === form.provinceCity)?.name || "";
    const district = districts.find(d => d.code === form.district)?.name || "";
    const ward = wards.find(w => w.code === form.wardCommune)?.name || "";

    if (!province || !district || !ward) return;

    const fullAddress = `${ward}, ${district}, ${province}`;
    const apiKey = import.meta.env.VITE_VIETMAP_API_KEY;

    fetch(`https://maps.vietmap.vn/api/search?text=${encodeURIComponent(fullAddress)}&apikey=${apiKey}`)
      .then(res => res.json())
      .then(data => {
        const features = data?.data?.features || data?.features;
        if (features && features.length > 0) {
          const [lng, lat] = features[0].geometry.coordinates;
          const newLat = lat.toFixed(6);
          const newLng = lng.toFixed(6);

          setForm(prev => ({
            ...prev,
            latitude: newLat,
            longitude: newLng,
          }));

          mapPickerRef.current?.flyTo([lng, lat]);
        }
      })
      .catch(err => {
        console.error("Lỗi tìm trung tâm phường/xã:", err);
      });
  }, [form.provinceCity, form.district, form.wardCommune, isView, provinces, districts, wards]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === "provinceCity") {
      setSelectedProvince(value);
      setForm(prev => ({ ...prev, district: "", wardCommune: "", latitude: "", longitude: "" }));
    } else if (name === "district") {
      setSelectedDistrict(value);
      setForm(prev => ({ ...prev, wardCommune: "", latitude: "", longitude: "" }));
    } else if (name === "wardCommune") {
      setForm(prev => ({ ...prev, latitude: "", longitude: "" }));
    }
  };

  const handleSave = () => {
    const { name, address, provinceCity, district, wardCommune, latitude, longitude } = form;
    if (!name || !address || !provinceCity || !district || !wardCommune || !latitude || !longitude) {
      toast.warn("Vui lòng nhập đầy đủ thông tin và chọn tọa độ!");
      return;
    }

    onSubmit(form);
    toast.success(mode === "add" ? "Thêm kho thành công!" : "Cập nhật kho thành công!");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-orange-50 w-full max-w-3xl p-6 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-orange-700">
            {mode === "add" ? "Thêm Kho Mới" : mode === "edit" ? "Chỉnh Sửa Kho" : "Xem Chi Tiết Kho"}
          </h2>
          <button
            onClick={onClose}
            className="text-3xl text-orange-600 hover:text-orange-800 transition cursor-pointer"
          >
            x
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tên kho *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={isView}
              placeholder="VD: Kho Hà Nội 1"
              className={isView ? disabledClass : enabledClass}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ cụ thể *</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              disabled={isView}
              placeholder="Số nhà, đường, thôn/xóm..."
              className={isView ? disabledClass : enabledClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tỉnh / Thành phố *</label>
              <select
                name="provinceCity"
                value={form.provinceCity}
                onChange={handleChange}
                disabled={isView}
                className={isView ? disabledClass : enabledClass}
              >
                <option value="">Chọn tỉnh</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Quận / Huyện *</label>
              <select
                name="district"
                value={form.district}
                onChange={handleChange}
                disabled={isView || !form.provinceCity}
                className={isView ? disabledClass : enabledClass}
              >
                <option value="">Chọn quận</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phường / Xã *</label>
              <select
                name="wardCommune"
                value={form.wardCommune}
                onChange={handleChange}
                disabled={isView || !form.district}
                className={isView ? disabledClass : enabledClass}
              >
                <option value="">Chọn phường</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Vị trí trên bản đồ *
            </label>

            {isView && form.latitude && form.longitude ? (
              <div className="p-4 bg-orange-100 rounded-lg text-sm space-y-2">
                <p className="font-semibold text-orange-700">Vị trí đã chọn:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      value={form.latitude}
                      readOnly
                      placeholder="Vĩ độ"
                      className="w-full p-2 border rounded bg-white"
                    />
                  </div>
                  <div>
                    <input
                      value={form.longitude}
                      readOnly
                      placeholder="Kinh độ"
                      className="w-full p-2 border rounded bg-white"
                    />
                  </div>
                </div>
                {form.address && (
                  <p className="text-gray-700 mt-1">
                    <strong>Địa chỉ:</strong> {form.address}
                  </p>
                )}
              </div>
            ) : (
              <VietmapPicker
                ref={mapPickerRef}
                latitude={form.latitude}
                longitude={form.longitude}
                address={form.address}
                onChange={({ latitude, longitude, address }) => {
                  setForm(prev => ({
                    ...prev,
                    latitude,
                    longitude,
                    address: address || prev.address,
                  }));
                }}
                disabled={isView}
                hideSearch={true} 
              />
            )}
          </div>
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