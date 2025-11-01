// src/store/shippingRateStore.js
import { useState, useEffect } from "react";
import { shippingRateService } from "../api/shippingRateService";

export const useShippingRateStore = (initialPage = 1, pageSize = 10) => {
  const [shippingRates, setShippingRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);
  

  // Modal quản lý phí ship: add | view
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("add"); // "add" | "view"
  const [selected, setSelected] = useState(null);

  // Modal tính phí ship

  // Lấy danh sách phí ship (chỉ phân trang, không search)
  const fetchShippingRates = async () => {
    try {
      setLoading(true);
      const data = await shippingRateService.getShippingRates(page, pageSize);
      setShippingRates(data.results || data || []);
      setTotalCount(data.count || data.length || 0);
    } catch (error) {
      console.error("Lỗi tải danh sách phí ship:", error);
      setShippingRates([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Gọi lại khi page hoặc pageSize thay đổi
  useEffect(() => {
    fetchShippingRates();
  }, [page, pageSize]);

  // Mở modal: add hoặc view
  const handleOpen = async (m, rate = null) => {
    setMode(m);
    if (m === "view" && rate?.id) {
      try {
        const detail = await shippingRateService.getShippingRateById(rate.id);
        setSelected(detail);
      } catch (error) {
        console.error("Lỗi tải chi tiết phí ship:", error);
        return;
      }
    } else {
      setSelected(rate);
    }
    setOpen(true);
  };

  // Đóng modal
  const handleClose = () => {
    setOpen(false);
    setSelected(null);
    setMode("add");
  };

  // Lưu phí ship mới (chỉ hỗ trợ thêm)
  const handleSave = async (data) => {
    try {
      await shippingRateService.createShippingRate(data);
      await fetchShippingRates(); // Tải lại danh sách
      handleClose();
      return { success: true, message: "Thêm phí ship thành công!" };
    } catch (error) {
      console.error("Lỗi khi thêm phí ship:", error);
      return { success: false, message: "Không thể thêm phí ship." };
    }
  };

  // ✅ Đổi trạng thái active (chỉ 1 active duy nhất)
    const handleToggleActive = async (id, currentStatus) => {
    if (currentStatus) return; // Đang active → không cho tắt thủ công

    try {
        // 1. Gọi API bật cái được chọn
        await shippingRateService.updateShippingRateActive(id, true);

        // 2. Cập nhật UI: bật cái này, tắt tất cả cái khác
        setShippingRates((prev) =>
        prev.map((r) => ({
            ...r,
            isActive: r.id === id ? true : false,
        }))
        );

        // 3. Tải lại dữ liệu để đảm bảo đồng bộ (nếu cần)
        // fetchShippingRates(); // Không cần nếu API đã đảm bảo
    } catch (error) {
        console.error("Lỗi cập nhật trạng thái:", error);
    }
    };

  return {
    // State
    shippingRates,
    loading,
    page,
    totalCount,
    pageSize,
    open,
    mode,
    selected,

    // Setters
    setPage,
    setOpen: handleClose, // override để có logic đóng sạch

    // Actions
    handleOpen,
    handleSave,
    handleToggleActive,
    fetchShippingRates,
  };
};