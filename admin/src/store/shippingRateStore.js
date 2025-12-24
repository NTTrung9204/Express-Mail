import { useState, useEffect } from "react";
import { shippingRateService } from "../api/shippingRateService";

export const useShippingRateStore = (initialPage = 1, pageSize = 10) => {
  const [shippingRates, setShippingRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);

  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [selected, setSelected] = useState(null);

  const fetchShippingRates = async () => {
    try {
      setLoading(true);
      setError(null); 

      const data = await shippingRateService.getShippingRates(page, pageSize);

      setShippingRates(data.results || data || []);
      setTotalCount(data.count || data.length || 0);
    } catch (err) {
      console.error("Lỗi tải danh sách phí ship:", err);

      if (err.response?.status === 403) {
        setError("Bạn không có quyền xem danh sách phí ship.");
      } else {
        setError("Không thể tải danh sách phí ship.");
      }

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
      
      return { 
        success: false, 
        message: error.response?.data?.message || "Không thể thêm phí ship.",
        status: error.response?.status 
      };
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    if (currentStatus) return;

    try {
      await shippingRateService.updateShippingRateActive(id, true);

      setShippingRates((prev) =>
        prev.map((r) => ({
          ...r,
          isActive: r.id === id,
        }))
      );
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      throw error;
    }
  };

  return {
    shippingRates,
    loading,
    error,
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
