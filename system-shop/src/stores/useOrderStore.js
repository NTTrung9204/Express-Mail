import { useState, useEffect, useCallback } from "react";
import { orderService } from "../api/orderService";

export const useOrderStore = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const shopId = user.id; 

  const getOrdersByShopId = useCallback(async () => {
    if (!shopId) return; 
    try {
      setLoading(true);
      setError(null);

      const res = await orderService.getOrdersByShopId(shopId);

      if (res.success) {
        const STATUS_MAP = {
          PENDING: "Đang xử lý",
          PICKUP_REQUESTED: "Yêu cầu lấy hàng",
          IN_TRANSIT: "Đang giao hàng",
          FINISHED: "Đã hoàn tất",
        };

        const formatted = res.data.map((o) => ({
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
        }));

        setOrders(formatted);
      } else {
        setError(res.message || "Lỗi khi tải đơn hàng");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    getOrdersByShopId();
  }, [getOrdersByShopId]);

  return { orders, loading, error, getOrdersByShopId };
};
