import React, { useState, useEffect, useRef } from "react";
// import { fetchProvinces } from "../../api/locationService";
import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WarehouseModal = ({ open, onClose, mode = "add", warehouse = {}, onSubmit }) => {
  const [form, setForm] = useState({
    name: "",
    address: "",
    wardCommune: "",
    provinceCity: "",
    status: "active",
    latitude: "",
    longitude: "",
  });

  // const [provinces, setProvinces] = useState([]);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const googleMapRef = useRef(null);
  const isView = mode === "view";

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const data = await fetchProvinces();
  //       setProvinces(data);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   })();
  // }, []);

  useEffect(() => {
    if (mode === "edit" && warehouse) {
      setForm((prev) => ({ ...prev, ...warehouse }));
    } else if (mode === "add") {
      setForm({
        name: "",
        address: "",
        wardCommune: "",
        provinceCity: "",
        status: "active",
        latitude: "",
        longitude: "",
      });
    }
  }, [mode, warehouse, open]);

  useEffect(() => {
    if (open && !isView && window.google) initMap();
  }, [open]);

  const initMap = () => {
    const initialPosition = {
      lat: form.latitude ? parseFloat(form.latitude) : 21.0285,
      lng: form.longitude ? parseFloat(form.longitude) : 105.8542,
    };

    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      center: initialPosition,
      zoom: 15,
    });

    markerRef.current = new window.google.maps.Marker({
      position: initialPosition,
      map: googleMapRef.current,
      draggable: mode !== "view",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const { name, address, wardCommune, provinceCity } = form;
    if (!name || !address || !wardCommune || !provinceCity) {
      toast.warn("Vui lòng nhập đầy đủ thông tin kho!");
      return;
    }

    onSubmit({ name, address, wardCommune, provinceCity });
    onClose();

    if (mode === "add") {
      toast.success("Thêm kho thành công!");
    } else if (mode === "edit") {
      toast.success("Cập nhật kho thành công!");
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-orange-50 w-full max-w-2xl p-6 rounded-xl shadow-xl max-h-screen overflow-y-auto">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {mode === "add" ? "Thêm Kho mới" : "Sửa Kho"}
            </h2>
            <button
              onClick={onClose}
              className="text-3xl hover:text-orange-600 cursor-pointer"
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
            <label className="block font-medium mb-1">Địa chỉ cụ thể</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              disabled={isView}
              placeholder="Nhập địa chỉ"
              className="w-full p-2 border rounded focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Xã / Phường</label>
              <input
                name="wardCommune"
                value={form.wardCommune}
                onChange={handleChange}
                disabled={isView}
                placeholder="Nhập Xã / Phường"
                className="w-full p-2 border rounded focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Tỉnh / Thành phố</label>
              <input
                name="provinceCity"
                value={form.provinceCity}
                onChange={handleChange}
                disabled={isView}
                placeholder="Nhập Tỉnh / Thành phố"
                className="w-full p-2 border rounded focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Bản đồ kho (hiển thị)</label>
            <div ref={mapRef} className="w-full h-64 border rounded"></div>
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

    </>
  );
};

export default WarehouseModal;
