import { useState, useEffect, useMemo } from "react";
import { postOfficeService } from "../api/postOfficeService";
import { getProvinces, getDistricts, getWards } from "../api/locationCache";

export const useWarehouseStore = (initialPage = 1, pageSize = 10) => {
  const [warehouses, setWarehouses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [modalMode, setModalMode] = useState("add");
  const [openWarehouseModal, setOpenWarehouseModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState(null);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  useEffect(() => {
    getProvinces().then(setProvinces);
  }, []);

  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setSelectedDistrict("");
      setWards([]);
      return;
    }
    getDistricts(selectedProvince).then(setDistricts);
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      return;
    }
    getWards(selectedDistrict).then(setWards);
  }, [selectedDistrict]);

  const fetchWarehouses = async (currentPage = page, currentSearch = search) => {
    setLoading(true);
    try {
      const data = await postOfficeService.getPostOffices(currentPage, pageSize, currentSearch);
      setWarehouses(data.results || data.items || []);
      setTotal(data.count || data.total || 0);
    } catch (error) {
      console.error("Lỗi tải kho:", error);
      setWarehouses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses(page, search);
  }, [page, pageSize]);

  const searchWarehouses = (query) => {
    const trimmed = query.trim();
    setSearch(trimmed);
    setPage(1);
    fetchWarehouses(1, trimmed); 
  };

  const provinceMap = useMemo(() => {
    const map = new Map();
    provinces.forEach((p) => map.set(String(p.code), p.name));
    return map;
  }, [provinces]);

  const getProvinceName = (code) =>
    code ? provinceMap.get(String(code)) || code : "-";

  const enhancedWarehouses = useMemo(() => {
    return warehouses.map((w) => ({
      ...w,
      displayProvince: getProvinceName(w.provinceCity),
    }));
  }, [warehouses, provinceMap]);

  const openAddWarehouse = () => {
    setModalMode("add");
    setEditingWarehouse(null);
    setSelectedProvince("");
    setSelectedDistrict("");
    setOpenWarehouseModal(true);
  };

  const openEditWarehouse = (warehouse) => {
    setModalMode("edit");
    setEditingWarehouse(warehouse);
    setSelectedProvince(warehouse.provinceCity || "");
    setSelectedDistrict(warehouse.district || "");
    setOpenWarehouseModal(true);
  };

  const openViewWarehouse = (warehouse) => {
    setModalMode("view");
    setEditingWarehouse(warehouse);
    setSelectedProvince(warehouse.provinceCity || "");
    setSelectedDistrict(warehouse.district || "");
    setOpenWarehouseModal(true);
  };

  const handleSubmitWarehouse = async (form) => {
    try {
      const payload = {
        name: form.name,
        address: form.address,
        provinceCity: form.provinceCity,
        district: form.district,
        wardCommune: form.wardCommune,
        latitude: parseFloat(form.latitude) || 0,
        longitude: parseFloat(form.longitude) || 0,
      };

      if (modalMode === "add") {
        await postOfficeService.createPostOffice(payload);
      } else if (editingWarehouse) {
        await postOfficeService.updatePostOffice(editingWarehouse.id, payload);
      }

      await fetchWarehouses();
      setOpenWarehouseModal(false);
      return { success: true };
    } catch (error) {
      console.error("Lỗi lưu kho:", error);
      return { success: false };
    }
  };

  const handleDeleteWarehouse = (warehouse) => {
    setWarehouseToDelete(warehouse);
    setOpenDeleteModal(true);
  };

  const confirmDeleteWarehouse = async () => {
    if (!warehouseToDelete) return { success: false };

    try {
      await postOfficeService.deletePostOffice(warehouseToDelete.id);
      if (warehouses.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await fetchWarehouses();
      }
      setOpenDeleteModal(false);
      setWarehouseToDelete(null);
      return { success: true };
    } catch (error) {
      console.error("Lỗi xóa kho:", error);
      return { success: false };
    }
  };

  return {
    warehouses: enhancedWarehouses,
    total,
    page,
    pageSize,
    loading,
    search,

    modalMode,
    openWarehouseModal,
    editingWarehouse,
    openDeleteModal,
    warehouseToDelete,

    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,

    setPage,
    setSearch,
    setOpenWarehouseModal,
    setOpenDeleteModal,
    setSelectedProvince,
    setSelectedDistrict,

    fetchWarehouses,
    searchWarehouses,
    openAddWarehouse,
    openEditWarehouse,
    openViewWarehouse,
    handleSubmitWarehouse,
    handleDeleteWarehouse,
    confirmDeleteWarehouse,
  };
};