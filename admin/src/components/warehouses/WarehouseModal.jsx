import React, { useEffect, useRef, useState } from "react";
import { useWarehouseStore } from "../../store/warehouseStore";
import { toast } from "react-toastify";

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

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_VIETMAP_API_KEY;
    if (!apiKey) {
      toast.error("Thiếu VITE_VIETMAP_API_KEY trong .env!");
      setMapError(true);
      return;
    }

    const scriptId = "vietmap-gl-js";
    const cssId = "vietmap-gl-css";

    if (window.vietmapgl) {
      window.vietmapgl.accessToken = apiKey;
      setMapLoaded(true);
      return;
    }

    if (!document.getElementById(scriptId)) {
      if (!document.getElementById(cssId)) {
        const link = document.createElement("link");
        link.id = cssId;
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/@vietmap/vietmap-gl-js@6.0.0/dist/vietmap-gl.css";
        document.head.appendChild(link);
      }

      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/@vietmap/vietmap-gl-js@6.0.0/dist/vietmap-gl.js";
      script.async = true;

      script.onload = () => {
        window.vietmapgl.accessToken = apiKey;
        setMapLoaded(true);
      };

      script.onerror = () => {
        setMapError(true);
        toast.error("Không tải được Vietmap SDK!");
      };

      document.body.appendChild(script);
    }
  }, []);

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
    if (!open || isView || !window.vietmapgl || mapInstance.current) return;

    const tryInitMap = () => {
      if (mapRef.current && !mapInstance.current) {
        initMap();
      } else {
        requestAnimationFrame(tryInitMap);
      }
    };
    tryInitMap();
  }, [open, isView]);

  useEffect(() => {
    if (!open || isView || !mapLoaded || !mapInstance.current) return;

    const { provinceCity, district, wardCommune } = form;
    if (!provinceCity || !district || !wardCommune) return;

    const province = provinces.find(p => p.code === provinceCity)?.name || "";
    const districtName = districts.find(d => d.code === district)?.name || "";
    const ward = wards.find(w => w.code === wardCommune)?.name || "";

    const fullAddress = `${ward}, ${districtName}, ${province}`;
    const apiKey = import.meta.env.VITE_VIETMAP_API_KEY;

    fetch(`https://maps.vietmap.vn/api/search?text=${encodeURIComponent(fullAddress)}&apikey=${apiKey}`)
      .then(res => res.json())
      .then(data => {
        const features = data?.data?.features || data?.features;
        if (features && features.length > 0) {
          const [lng, lat] = features[0].geometry.coordinates;
          setForm(prev => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
          markerInstance.current?.setLngLat([lng, lat]);
          mapInstance.current.flyTo({ center: [lng, lat], zoom: 13 });
        }
      })
      .catch(err => console.error("Lỗi gọi Vietmap API:", err));
  }, [form.provinceCity, form.district, form.wardCommune, open, isView, mapLoaded, provinces, districts, wards]);

  const initMap = () => {
    if (!mapRef.current || !window.vietmapgl || mapInstance.current) return;

    const lat = form.latitude ? parseFloat(form.latitude) : 21.0285;
    const lng = form.longitude ? parseFloat(form.longitude) : 105.8542;

    const map = new window.vietmapgl.Map({
      container: mapRef.current,
      style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${import.meta.env.VITE_VIETMAP_API_KEY}`,
      center: [lng, lat],
      zoom: 15,
    });

    mapInstance.current = map;

    const marker = new window.vietmapgl.Marker({
      draggable: !isView,
    })
      .setLngLat([lng, lat])
      .addTo(map);

    markerInstance.current = marker;

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      setForm(prev => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
      }));
      marker.setLngLat([lng, lat]);
    });

    marker.on("dragend", () => {
      const { lng, lat } = marker.getLngLat();
      setForm(prev => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
      }));
    });

    map.on("load", () => {
      setMapLoaded(true);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === "provinceCity") {
      setSelectedProvince(value);
      setForm(prev => ({ ...prev, district: "", wardCommune: "" }));
    } else if (name === "district") {
      setSelectedDistrict(value);
      setForm(prev => ({ ...prev, wardCommune: "" }));
    }
  };

  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    const lat = name === "latitude" ? parseFloat(value) : parseFloat(form.latitude);
    const lng = name === "longitude" ? parseFloat(value) : parseFloat(form.longitude);

    if (!isNaN(lat) && !isNaN(lng) && markerInstance.current && mapInstance.current) {
      const pos = [lng, lat];
      markerInstance.current.setLngLat(pos);
      mapInstance.current.flyTo({ center: pos, zoom: 16 });
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

  useEffect(() => {
    if (!open && mapInstance.current) {
      try {
        mapInstance.current.remove(); 
      } catch (err) {
        console.warn("Lỗi khi hủy map:", err);
      }
      mapInstance.current = null;
      markerInstance.current = null;
      setMapLoaded(false);
    }
  }, [open]);


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
            ×
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Vĩ độ (Latitude) *</label>
              <input
                name="latitude"
                value={form.latitude}
                onChange={handleCoordinateChange}
                disabled={isView}
                placeholder="21.028511"
                className={isView ? disabledClass : enabledClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kinh độ (Longitude) *</label>
              <input
                name="longitude"
                value={form.longitude}
                onChange={handleCoordinateChange}
                disabled={isView}
                placeholder="105.854200"
                className={isView ? disabledClass : enabledClass}
              />
            </div>
          </div>

          {!isView && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Vị trí trên bản đồ (Click hoặc kéo marker để chọn)
              </label>
              <div
                ref={mapRef}
                className="w-full h-80 border-2 border-orange-300 rounded-lg relative overflow-hidden"
                style={{ minHeight: "320px" }}
              >
                {!mapLoaded && !mapError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-orange-50/80">
                    <p className="text-orange-600">Đang tải bản đồ Vietmap...</p>
                  </div>
                )}
                {mapError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-orange-50/90 text-red-600 p-4 text-center">
                    <p className="font-bold text-lg">Lỗi tải Vietmap</p>
                    <p className="text-sm">Kiểm tra VITE_VIETMAP_API_KEY hoặc kết nối mạng.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {isView && form.latitude && form.longitude && (
            <div className="mt-4 p-4 bg-orange-100 rounded-lg text-sm">
              <p className="font-semibold text-orange-700 mb-1">Vị trí đã chọn:</p>
              <p>
                <strong>Vĩ độ:</strong> {form.latitude} | <strong>Kinh độ:</strong> {form.longitude}
              </p>
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