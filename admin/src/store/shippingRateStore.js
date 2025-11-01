import { useState, useEffect } from "react";
import { shippingRateService } from "../api/shippingRateService";

export const useShippingRateStore = (initialPage = 1, pageSize = 10) => {
  const [shippingRates, setShippingRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);
  

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [selected, setSelected] = useState(null);

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

  useEffect(() => {
    fetchShippingRates();
  }, [page, pageSize]);

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

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
    setMode("add");
  };

  const handleSave = async (data) => {
    try {
      await shippingRateService.createShippingRate(data);
      await fetchShippingRates(); 
      handleClose();
      return { success: true, message: "Thêm phí ship thành công!" };
    } catch (error) {
      console.error("Lỗi khi thêm phí ship:", error);
      return { success: false, message: "Không thể thêm phí ship." };
    }
  };

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
    shippingRates,
    loading,
    page,
    totalCount,
    pageSize,
    open,
    mode,
    selected,

    setPage,
    setOpen: handleClose, 

    handleOpen,
    handleSave,
    handleToggleActive,
    fetchShippingRates,
  };
};