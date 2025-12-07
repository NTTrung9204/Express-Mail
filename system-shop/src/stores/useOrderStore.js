import { useState, useEffect, useCallback, useRef } from "react";
import { orderService } from "../api/orderService";

const initialPagination = {
  page: 1,
  limit: 9, 
  total: 0,
  totalPages: 0,
};

export const useOrderStore = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(initialPagination);
  const [filters, setFilters] = useState({});

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const shopId = user.id;

  const filtersRef = useRef(filters);
  const paginationRef = useRef(pagination);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const STATUS_MAP = {
    PENDING: "Đang xử lý",
    PICKUP_REQUESTED: "Yêu cầu lấy hàng",
    IN_TRANSIT: "Đang vận chuyển",
    SHIPPING: 'Đang giao hàng',
    FINISHED: "Đã hoàn tất",
    RETURNING: "Đang hoàn hàng",
    PICKUP_FAILED: "Lấy hàng thất bại",
    DELIVERY_FAILED: "Giao hàng thất bại"
  };

  const formatOrders = (data) => {
      return data.map((o) => ({
          id: o.id,
          code: o.code || "-",
          phone: o.receiver_phone || "-",
          address: o.receiver_address || "-",
          cod: o.cod ? `${o.cod.toLocaleString()} đ` : "0 đ",
          weight: o.weight ? `${o.weight * 1000}` : "0",
          payer: o.is_receiver_pay_shipping
            ? "Bên nhận trả phí"
            : "Bên gửi trả phí",
          total: `${(
            (o.cod || 0) +
            (o.shipping_cost || 0) +
            (o.shipping_cost_payper || 0)
          ).toLocaleString()} đ`,
          status: STATUS_MAP[o.shipping_status] || o.shipping_status || "Không rõ",
          rawStatus: o.shipping_status,
      }));
  };

  const getOrdersByShopId = useCallback(async (page = 1, limit = 9, customFilters = {}) => {
    if (!shopId) return;
    try {
      setLoading(true);
      setError(null);

      const activeFilters = Object.entries(customFilters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const res = await orderService.getOrdersByShopId(shopId, page, limit, activeFilters);

      if (res && res.data) {
        const responseData = res.data;
        const dataArray = Array.isArray(responseData) ? responseData : responseData.data || [];
        const meta = responseData.meta || {};

        const formatted = formatOrders(dataArray);

        setOrders(formatted);
        
        const newPagination = {
          page: meta.page || page,
          limit: meta.limit || limit,
          total: meta.total || 0,
          totalPages: meta.totalPages || Math.ceil((meta.total || 0) / (meta.limit || limit))
        };
        setPagination(newPagination);

      } else {
        console.error('Invalid response structure:', res);
        setError("Lỗi khi tải đơn hàng: Dữ liệu không hợp lệ");
        setOrders([]);
        setPagination(initialPagination);
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || err.message || "Lỗi kết nối server ");
      setOrders([]);
      setPagination(initialPagination);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  const goToPage = useCallback(async (page) => {
    const currentLimit = paginationRef.current.limit;
    const totalPages = paginationRef.current.totalPages;
    const currentFilters = filtersRef.current;
    
    if (page < 1 || page > totalPages) {
      console.warn('Page out of range:', page);
      return;
    }
    
    await getOrdersByShopId(page, currentLimit, currentFilters);
  }, [getOrdersByShopId]);


  const applyFilters = useCallback(async (newFilters) => {
    const updatedFilters = { ...filtersRef.current, ...newFilters };
    setFilters(updatedFilters);
    await getOrdersByShopId(1, paginationRef.current.limit, updatedFilters);
  }, [getOrdersByShopId]);

  const clearFilters = useCallback(async () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    await getOrdersByShopId(1, paginationRef.current.limit, emptyFilters);
  }, [getOrdersByShopId]);

  const nextPage = useCallback(async () => {
    const currentPage = paginationRef.current.page;
    const totalPages = paginationRef.current.totalPages;
    
    if (currentPage < totalPages) {
      await goToPage(currentPage + 1);
    } else {
      console.warn('Already at last page');
    }
  }, [goToPage]);

  const prevPage = useCallback(async () => {
    const currentPage = paginationRef.current.page;
        
    if (currentPage > 1) {
      await goToPage(currentPage - 1);
    } else {
      console.warn('Already at first page');
    }
  }, [goToPage]);

  useEffect(() => {
    getOrdersByShopId(initialPagination.page, initialPagination.limit, filters);
  }, [getOrdersByShopId]);

  return {
    orders,
    loading,
    error,
    pagination, 
    filters, 
    getOrdersByShopId, 
    applyFilters,
    clearFilters,
    goToPage,
    nextPage,
    prevPage,
  };
};