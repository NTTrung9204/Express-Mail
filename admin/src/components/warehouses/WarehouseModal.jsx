import React, { useState, useEffect, useRef } from "react";
import { fetchProvinces, fetchDistricts, fetchWards } from "../../api/locationService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const loadGoogleMapsScript = (apiKey, callback) => {
  if (window.google && window.google.maps) {
    callback();
    return;
  }

  const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
  if (existingScript) {
    existingScript.onload = callback;
    return;
  }

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
  script.async = true;
  script.defer = true;
  script.onerror = () => callback(new Error("Script load failed"));
  script.onload = callback;
  document.body.appendChild(script);
};

const WarehouseModal = ({ open, onClose, mode = "add", warehouse = {}, onSubmit }) => {
  const isView = mode === "view";
  const disabledBg = "bg-orange-100";
  const defaultClass = "w-full p-2 border rounded focus:outline-none";
  const disabledClass = `${defaultClass} ${disabledBg}`;
  const enabledClass = `${defaultClass} focus:border-orange-500`;

  const [form, setForm] = useState({
    name: "",
    address: "",
    provinceCity: "",
    district: "",
    wardCommune: "",
    status: "active",
    latitude: "",
    longitude: "",
  });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [mapError, setMapError] = useState(false);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const googleMapRef = useRef(null);

  const getCodeByName = (value, list) => {
    if (!value || !list || list.length === 0) return value;
    const item = list.find((i) => i.name === value || i.code === value);
    return item ? item.code : value;
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProvinces();
        setProvinces(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const fetchDistrictsData = async (provinceCode) => {
    try {
      const data = await fetchDistricts(provinceCode);
      setDistricts(data);
      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const fetchWardsData = async (districtCode) => {
    try {
      const data = await fetchWards(districtCode);
      setWards(data);
      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    if (warehouse && mode !== "add" && provinces.length > 0) {
      const provinceCode = getCodeByName(warehouse.provinceCity, provinces);

      setForm({
        name: warehouse.name || "",
        address: warehouse.address || "",
        provinceCity: provinceCode,
        district: getCodeByName(warehouse.district, []),
        wardCommune: getCodeByName(warehouse.wardCommune, []),
        status: warehouse.status || "active",
        latitude: warehouse.latitude || "",
        longitude: warehouse.longitude || "",
      });

      const loadLocations = async () => {
        if (provinceCode) {
          const loadedDistricts = await fetchDistrictsData(provinceCode);
          const districtCode = getCodeByName(warehouse.district, loadedDistricts);
          setForm((prev) => ({ ...prev, district: districtCode }));

          if (districtCode) {
            const loadedWards = await fetchWardsData(districtCode);
            const wardCode = getCodeByName(warehouse.wardCommune, loadedWards);
            setForm((prev) => ({ ...prev, wardCommune: wardCode }));
          }
        }
      };
      loadLocations();
    } else if (mode === "add") {
      setForm({
        name: "",
        address: "",
        provinceCity: "",
        district: "",
        wardCommune: "",
        status: "active",
        latitude: "",
        longitude: "",
      });
      setDistricts([]);
      setWards([]);
    }
  }, [warehouse, mode, open, provinces]);

  useEffect(() => {
    setMapError(false);
    if (open) {
      const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;
      window.gm_authFailure = () => {
        console.error("Google Maps Error: Invalid or missing API key");
        setMapError(true);
      };

      loadGoogleMapsScript(apiKey, (error) => {
        if (error || !window.google || !window.google.maps) {
          setMapError(true);
          return;
        }
        initMap();
      });
    }
  }, [open, form.latitude, form.longitude]);

  const initMap = () => {
    if (!window.google || !window.google.maps || !mapRef.current) {
      setMapError(true);
      return;
    }

    try {
      const lat = form.latitude ? parseFloat(form.latitude) : 21.0285;
      const lng = form.longitude ? parseFloat(form.longitude) : 105.8542;
      const initialPosition = { lat, lng };

      if (!googleMapRef.current) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: initialPosition,
          zoom: 15,
        });

        markerRef.current = new window.google.maps.Marker({
          position: initialPosition,
          map: googleMapRef.current,
          draggable: !isView,
        });

        if (!isView) {
          googleMapRef.current.addListener("click", (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setForm((prev) => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
            markerRef.current.setPosition({ lat, lng });
          });

          markerRef.current.addListener("dragend", () => {
            const lat = markerRef.current.getPosition().lat();
            const lng = markerRef.current.getPosition().lng();
            setForm((prev) => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
          });
        }
      } else {
        markerRef.current.setPosition(initialPosition);
        googleMapRef.current.panTo(initialPosition);
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "provinceCity") {
      setDistricts([]);
      setWards([]);
      setForm((prev) => ({ ...prev, district: "", wardCommune: "" }));
      if (value) fetchDistrictsData(value);
    }
    if (name === "district") {
      setWards([]);
      setForm((prev) => ({ ...prev, wardCommune: "" }));
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
    const { name, address, provinceCity, district, wardCommune, latitude, longitude } = form;
    if (!name || !address || !provinceCity || !district || !wardCommune || !latitude || !longitude) {
      toast.warn("Vui lòng nhập đầy đủ thông tin và chọn tọa độ kho!");
      return;
    }

    const payload = {
      ...form,
      provinceCity: getCodeByName(provinceCity, provinces),
      district: getCodeByName(district, districts),
      wardCommune: getCodeByName(wardCommune, wards),
    };

    onSubmit(payload);
    toast.success(mode === "add" ? "Thêm kho thành công!" : "Cập nhật kho thành công!");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-orange-50 w-full max-w-2xl p-6 rounded-xl shadow-xl max-h-screen overflow-y-auto">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {mode === "add" ? "Thêm Kho mới" : mode === "edit" ? "Sửa Kho" : "Xem Kho"}
          </h2>
          <button onClick={onClose} className="text-3xl hover:text-orange-600 cursor-pointer">
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
            className={isView ? disabledClass : enabledClass}
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Địa chỉ cụ thể</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            disabled={isView}
            placeholder="Nhập địa chỉ"
            className={isView ? disabledClass : enabledClass}
          />
        </div>

        <div className="mb-4 grid grid-cols-3 gap-4">
          <select
            name="provinceCity"
            value={form.provinceCity}
            onChange={handleChange}
            disabled={isView}
            className={isView ? disabledClass : enabledClass}
          >
            <option value="">Chọn Tỉnh / Thành phố</option>
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
            disabled={isView || !form.provinceCity}
            className={isView ? disabledClass : enabledClass}
          >
            <option value="">Chọn Quận / Huyện</option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            name="wardCommune"
            value={form.wardCommune}
            onChange={handleChange}
            disabled={isView || !form.district}
            className={isView ? disabledClass : enabledClass}
          >
            <option value="">Chọn Xã / Phường</option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Vĩ độ (Latitude)</label>
            <input
              name="latitude"
              value={form.latitude}
              onChange={handleCoordinateChange}
              disabled={isView}
              placeholder="Vĩ độ"
              className={isView ? disabledClass : enabledClass}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Kinh độ (Longitude)</label>
            <input
              name="longitude"
              value={form.longitude}
              onChange={handleCoordinateChange}
              disabled={isView}
              placeholder="Kinh độ"
              className={isView ? disabledClass : enabledClass}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Bản đồ kho</label>
          <div ref={mapRef} className="w-full h-64 border rounded relative">
            {mapError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-orange-50/90 text-red-600 p-4 rounded text-center">
                <p className="font-bold mb-2">Lỗi tải Google Maps</p>
                <p className="text-sm">
                  Vui lòng kiểm tra API Key (VITE_GOOGLE_MAP_API_KEY) hoặc kết nối mạng.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
          >
            {isView ? "Đóng" : "Hủy"}
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
