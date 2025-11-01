import { useState, useEffect } from "react";
import { postOfficeService } from "../api/postOfficeService";
import { fetchProvinces } from "../api/locationService"; 

const findNameByCode = (code, list) => {
    if (!code || !list) return code;
    const item = list.find(p => p.code === code);
    return item ? item.name : code;
};

export const useWarehouseStore = (initialPage = 1, limit = 20) => {
  const [warehouses, setWarehouses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState("add");
  const [openWarehouseModal, setOpenWarehouseModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState(null);
  
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProvinces();
        setProvinces(data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách tỉnh thành:", err);
      }
    })();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const data = await postOfficeService.getPostOffices(page, limit);
      setWarehouses(data.results || []);
      setTotal(data.count || 0);
    } catch (error) {
      console.error("Lỗi khi tải danh sách kho:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (warehouse) => {
    setSelectedWarehouse(warehouse);
    setOpenUserModal(true);
  };

  const handleSubmitUser = async (userId) => {
    try {
      await postOfficeService.addStaffToOffice(selectedWarehouse.id, userId);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const openAddWarehouse = () => {
    setModalMode("add");
    setEditingWarehouse(null);
    setOpenWarehouseModal(true);
  };

  const openEditWarehouse = (warehouse) => {
    setModalMode("edit");
    setEditingWarehouse(warehouse);
    setOpenWarehouseModal(true);
  };

  const openViewWarehouse = (warehouse) => {
    setModalMode("view");
    setEditingWarehouse(warehouse);
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
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      };

      if (modalMode === "add") {
        await postOfficeService.createPostOffice(payload);
      } else if (editingWarehouse)  {
        await postOfficeService.updatePostOffice(editingWarehouse.id, payload);
      }

      await fetchWarehouses();
      setOpenWarehouseModal(false);
      return true;
    } catch (error) {
      console.error("Lỗi khi lưu kho:", error);
      return false;
    }
  };

  const handleDeleteWarehouse = (warehouse) => {
    setWarehouseToDelete(warehouse);
    setOpenDeleteModal(true);
  };

  const confirmDeleteWarehouse = async (id) => {
    try {
      await postOfficeService.deletePostOffice(id);
      await fetchWarehouses();
      setOpenDeleteModal(false);
      return true;
    } catch (error) {
      console.error("Lỗi khi xóa kho:", error);
      return false;
    }
  };

  const enhancedWarehouses = warehouses.map(w => {
      
      let provinceName = w.provinceCity;

      if (provinces.length > 0) {
          provinceName = findNameByCode(w.provinceCity, provinces);
      }

      return {
          ...w,
          displayProvince: provinceName, 
      };
  });
  
  const filteredWarehouses = enhancedWarehouses.filter((w) =>
    w.name?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetchWarehouses();
  }, [page]);

  return {
    warehouses: filteredWarehouses, 
    total,
    page,
    limit,
    loading,
    search,
    modalMode,
    openWarehouseModal,
    editingWarehouse,
    openUserModal,
    selectedWarehouse,
    openDeleteModal,
    warehouseToDelete,

    setPage,
    setSearch,
    setOpenWarehouseModal,
    setOpenUserModal,
    setOpenDeleteModal,
    fetchWarehouses,
    handleAddUser,
    handleSubmitUser,
    openAddWarehouse,
    openEditWarehouse,
    openViewWarehouse,
    handleSubmitWarehouse,
    handleDeleteWarehouse,
    confirmDeleteWarehouse,
  };
};
