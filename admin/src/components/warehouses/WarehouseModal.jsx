import React, { useState, useEffect, useRef } from "react";
import { fetchProvinces, fetchDistricts, fetchWards } from "../../api/locationService";

const WarehouseModal = ({
  open,
  onClose,
  mode = "add", 
  warehouse = {},
  onSubmit,
}) => {
  const [form, setForm] = useState({
    name: "",
    province: "",
    district: "",
    ward: "",
    status: "active",
    latitude: "",
    longitude: "",
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const googleMapRef = useRef(null);

  useEffect(() => {
    fetchProvincesData();
  }, []);

  useEffect(() => {
    if (mode !== "add" && warehouse) {
      setForm((prev) => ({ ...prev, ...warehouse }));
      if (warehouse.province) fetchDistrictsData(warehouse.province);
      if (warehouse.district) fetchWardsData(warehouse.district);
    }
  }, [mode, warehouse]);

  useEffect(() => {
    if (open && !isView && window.google) {
      initMap();
    }
  }, [open]);

  useEffect(() => {
  if (open && !isView) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }
}, [open]);


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

  const initMap = () => {
    const initialPosition = {
      lat: form.latitude ? parseFloat(form.latitude) : 21.0285, 
      lng: form.longitude ? parseFloat(form.longitude) : 105.8542,
    };

    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      center: initialPosition,
      zoom: 15,
      disableDefaultUI: mode === "view",
    });

    markerRef.current = new window.google.maps.Marker({
      position: initialPosition,
      map: googleMapRef.current,
      draggable: mode !== "view",
    });

    if (mode !== "view") {
      googleMapRef.current.addListener("click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setForm((prev) => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
        markerRef.current.setPosition({ lat, lng });
      }); 

      markerRef.current.addListener("dragend", () => {
        const lat = markerRef.current.getPosition().lat();
        const lng = markerRef.current.getPosition().lng();
        setForm((prev) => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "province") {
      setDistricts([]);
      setWards([]);
      setForm((prev) => ({ ...prev, district: "", ward: "" }));
      if (value) fetchDistrictsData(value);
    }
    if (name === "district") {
      setWards([]);
      setForm((prev) => ({ ...prev, ward: "" }));
      if (value) fetchWardsData(value);
    }
  };

  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (markerRef.current && googleMapRef.current) {
      const lat = name === "latitude" ? parseFloat(value) : parseFloat(form.latitude);
      const lng = name === "longitude" ? parseFloat(value) : parseFloat(form.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        const position = { lat, lng };
        markerRef.current.setPosition(position);
        googleMapRef.current.panTo(position);
      }
    }
  };

  const handleSave = () => {
    if (!form.latitude || !form.longitude) {
      alert("Vui lòng chọn tọa độ kho trên bản đồ.");
      return;
    }
    onSubmit(form);
    onClose();
  };

  if (!open) return null;

  const isView = mode === "view";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-orange-50 w-full max-w-2xl p-6 rounded-xl shadow-xl max-h-screen overflow-y-auto">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {mode === "add" ? "Thêm Kho mới" : mode === "edit" ? "Sửa Kho" : "Xem Kho"}
          </h2>
          <button
            onClick={onClose}
            className="text-4xl hover:text-orange-600 cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Tên kho</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            disabled={isView}
            placeholder="Nhập tên kho"
            className="w-full p-2 border rounded focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Địa chỉ</label>
          <div className="grid grid-cols-3 gap-4">
            <select
              name="province"
              value={form.province}
              onChange={handleChange}
              disabled={isView}
              className="w-full p-2 border rounded focus:outline-none focus:border-orange-500"
            >
              <option value="">Chọn tỉnh / thành</option>
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
              className="w-full p-2 border rounded focus:outline-none focus:border-orange-500"
            >
              <option value="">Chọn quận / huyện</option>
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
              className="w-full p-2 border rounded focus:outline-none focus:border-orange-500"
            >
              <option value="">Chọn xã / phường</option>
              {wards.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Tọa độ kho</label>
          <div className="grid grid-cols-2 gap-4 mb-2">
            <input
              name="latitude"
              value={form.latitude}
              onChange={handleCoordinateChange}
              disabled={isView}
              placeholder="Vĩ độ"
              className="w-full p-2 border rounded focus:outline-none focus:border-orange-500"
            />
            <input
              name="longitude"
              value={form.longitude}
              onChange={handleCoordinateChange}
              disabled={isView}
              placeholder="Kinh độ"
              className="w-full p-2 border rounded focus:outline-none focus:border-orange-500"
            />
          </div>
          <div
            ref={mapRef}
            className="w-full h-64 border rounded"
          ></div>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Trạng thái</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            disabled={isView}
            className="w-full p-2 border rounded focus:outline-none focus:border-orange-500"
          >
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
          >
            Hủy
          </button>
          {!isView && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 cursor-pointer"
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