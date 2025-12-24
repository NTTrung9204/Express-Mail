import { useState, useEffect, useCallback, useRef } from "react";
import { orderService } from "../api/orderService";

export const useOrderHistoryStore = () => {
  const baseURL = import.meta.env.VITE_NESTJS_API_URL;
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const shopId = user.id;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    code: '',
    shopId: '',
    order_status: '',
    shipping_status: ''
  });

  const filtersRef = useRef(filters);
  const paginationRef = useRef(pagination);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const STATUS_MAP = {
    PICKUP_REQUESTED: "Đang lấy hàng",
    PICKUP_FAILED: "Lấy hàng thất bại",
    DELIVERY_FAILED: "Giao hàng thất bại",
    RETURNING: "Đang trả hàng",
    SHIPPING: "Đang giao hàng",
    FINISHED: "Hoàn tất",
    CREATED: "Đơn đã được tạo",
    PENDING: "Chờ xử lý",
    TRANSITING: "Đang trung chuyển",
    DONE: "Đã chuyển",
  };

  const formatOrders = (data) => {
    return data.map((o) => ({
      id: o.id,
      code: o.code || "-",
      shopId: o.shopId,
      receiver: o.receiver_name || "-",
      phone: o.receiver_phone || "-",
      province: o.receiver_province_city || "-",
      ward: o.receiver_ward_commune || "-",
      address: o.receiver_address || "-",
      coordinate: o.receiver_coordinate || "-",
      dimensions: {
        length: o.length || 0,
        width: o.width || 0,
        height: o.height || 0
      },
      weight: o.weight ? `${o.weight * 1000}` : "0",
      cod: o.cod ? `${o.cod.toLocaleString()} đ` : "0 đ",
      codValue: o.cod || 0,
      shippingCost: o.shipping_cost || 0,
      shippingCostPayper: o.shipping_cost_payper || 0,
      payer: o.is_receiver_pay_shipping
        ? "Bên nhận trả phí"
        : "Bên gửi trả phí",
      total: `${(
        (o.cod || 0) +
        (o.is_receiver_pay_shipping ? o.shipping_cost : 0)
      ).toLocaleString()} đ`,
      shippingStatus: STATUS_MAP[o.shipping_status] || o.shipping_status || "Không rõ",
      shippingStatusRaw: o.shipping_status,
      orderStatus: STATUS_MAP[o.order_status] || o.order_status || "Không rõ",
      orderStatusRaw: o.order_status,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      products: (o.products || []).map(p => ({
        ...p,
        img_url: p.img_url && !p.img_url.startsWith('https') 
          ? `${baseURL}${p.img_url}` 
          : p.img_url                   
      })),
      transitions: o.transitions || [],
      shipping: o.shipping || [],
      orderPostOffices: o.orderPostOffices || [],
      shopProfile: o.shopProfile || null,
      raw: o
    }));
  };

  const getOrders = useCallback(async (page = 1, limit = 9, customFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const activeFilters = Object.entries(customFilters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const res = await orderService.getOrders(shopId,page, limit, activeFilters);

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
      }
    } catch (err) {
      console.error('API Error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setLoading(false);
        throw err;
      }
      
      setError(err.response?.data?.message || err.message || "Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(async (newFilters) => {
    const updatedFilters = { ...filtersRef.current, ...newFilters };
    setFilters(updatedFilters);
    await getOrders(1, paginationRef.current.limit, updatedFilters);
  }, [getOrders]);

  const clearFilters = useCallback(async () => {
    const emptyFilters = {
      code: '',
      shopId: '',
      order_status: '',
      shipping_status: ''
    };
    setFilters(emptyFilters);
    await getOrders(1, paginationRef.current.limit, emptyFilters);
  }, [getOrders]);

  const goToPage = useCallback(async (page) => {
    if (page < 1 || page > paginationRef.current.totalPages) {
      console.warn('Page out of range:', page);
      return;
    }
    
    await getOrders(page, paginationRef.current.limit, filtersRef.current);
  }, [getOrders]);

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

  const changePageSize = useCallback(async (limit) => {
    await getOrders(1, limit, filtersRef.current);
  }, [getOrders]);

  const refreshOrders = useCallback(async () => {
    await getOrders(paginationRef.current.page, paginationRef.current.limit, filtersRef.current);
  }, [getOrders]);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  return {
    orders,
    loading,
    error,
    pagination,
    filters,
    getOrders,
    applyFilters,
    clearFilters,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    refreshOrders
  };
};