import React, { useState, useEffect } from "react";
import { Visibility, Replay, Search, Undo } from "@mui/icons-material";
import OrderDetailModal from "../../components/orders/failed_orders/OrderDetailModal";
import ConfirmResendModal from "../../components/orders/failed_orders/ConfirmResendModal";
import Pagination from "../../components/common/Pagination";
import { ordersAPI } from "../../api/ordersAPI";
import { nestJSAPI } from "../../api/axiosInstances";
import { toast } from "react-toastify";
import authAPI from "../../api/authAPI";
import { fetchUserPostOfficeId } from "../../api/profileAPI";
import ProtectedComponent from "../../components/common/ProtectedComponent";

const FailedOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [returningOrderId, setReturningOrderId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [postOfficeId, setPostOfficeId] = useState(null);
  const [activeTab, setActiveTab] = useState("pickup"); // "pickup" or "delivery"
  const [pickupFailedCount, setPickupFailedCount] = useState(0);
  const [deliveryFailedCount, setDeliveryFailedCount] = useState(0);

  // Get post office ID from user data via API
  useEffect(() => {
    const fetchPostOfficeId = async () => {
      const user = authAPI.getUser();
      const userId = user?.id;

      if (!userId) {
        toast.error("Không tìm thấy User ID. Vui lòng đăng nhập lại.");
        return;
      }

      const id = await fetchUserPostOfficeId(userId);
      if (id) {
        setPostOfficeId(id);
      } else {
        toast.error("Không thể xác định ID Bưu cục của người dùng.");
      }
    };

    fetchPostOfficeId();
  }, []);

  // Count failed shippings for an order based on failure status
  const countFailedShippings = (order, failureStatus) => {
    if (!order.shipping || !Array.isArray(order.shipping)) {
      return 0;
    }
    return order.shipping.filter(
      (ship) => ship.status === failureStatus
    ).length;
  };

  // Get return status text
  const getReturnStatus = (order) => {
    if (order.order_status === "CANCELED") {
      return "Đang hoàn hàng";
    }
    return null;
  };

  // Handle return order (hoàn hàng)
  const handleReturnOrder = async (order) => {
    if (!order.shopProfile) {
      toast.error("Không tìm thấy thông tin shop");
      return;
    }

    const shopLat = order.shopProfile.latitude;
    const shopLng = order.shopProfile.longitude;

    if (!shopLat || !shopLng) {
      toast.error("Không tìm thấy tọa độ shop");
      return;
    }

    setReturningOrderId(order.id);
    try {
      const payload = {
        receiver_coordinate: `${shopLat},${shopLng}`,
        order_status: "CANCELED"
      };

      const response = await nestJSAPI.patch(`/orders/${order.id}`, payload);

      if (response && response.data) {
        toast.success("Hoàn hàng thành công");
        fetchOrders();
      } else {
        toast.error("Hoàn hàng thất bại");
      }
    } catch (error) {
      console.error("Error returning order:", error);
      toast.error(error.response?.data?.message || "Lỗi khi hoàn hàng");
    } finally {
      setReturningOrderId(null);
    }
  };

  // Filter orders by failed shipping status
  const filterFailedOrders = (ordersData, failureStatus) => {
    return ordersData.filter((order) => {
      if (!order.shipping || !Array.isArray(order.shipping)) {
        return false;
      }
      return order.shipping.some((ship) => ship.status === failureStatus);
    });
  };

  // Fetch orders
  const fetchOrders = async () => {
    if (!postOfficeId) return;

    setLoading(true);
    try {
      let response;
      
      if (activeTab === "pickup") {
        response = await ordersAPI.getPickupOrders(postOfficeId, page, limit);
      } else {
        response = await ordersAPI.getReceivedOrders(postOfficeId, page, limit);
      }
      
      if (response.success) {
        let fetchedOrders = response.data.data || [];
        
        // Filter orders based on active tab
        if (activeTab === "pickup") {
          fetchedOrders = filterFailedOrders(fetchedOrders, "PICKUP_FAILED");
        } else {
          fetchedOrders = filterFailedOrders(fetchedOrders, "DELIVERY_FAILED");
        }
        
        setOrders(fetchedOrders);
        setTotal(response.data.total || response.data.meta?.total || 0);
      } else {
        toast.error("Lỗi khi lấy danh sách đơn hàng");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Lỗi khi lấy danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // Fetch order counts for both tabs
  const fetchOrderCounts = async () => {
    if (!postOfficeId) return;

    try {
      // Fetch all pickup orders to count PICKUP_FAILED
      const pickupRes = await ordersAPI.getPickupOrders(postOfficeId, 1, 10);
      const allPickupOrders = pickupRes.data?.data || [];
      const pickupFailed = filterFailedOrders(allPickupOrders, "PICKUP_FAILED");
      setPickupFailedCount(pickupFailed.length);

      // Fetch all received orders to count DELIVERY_FAILED
      const deliveryRes = await ordersAPI.getReceivedOrders(postOfficeId, 1, 10);
      const allDeliveryOrders = deliveryRes.data?.data || [];
      const deliveryFailed = filterFailedOrders(allDeliveryOrders, "DELIVERY_FAILED");
      setDeliveryFailedCount(deliveryFailed.length);
    } catch (error) {
      console.error("Error fetching order counts:", error);
    }
  };

  useEffect(() => {
    if (postOfficeId) {
      setPage(1);
      fetchOrders();
      fetchOrderCounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postOfficeId, activeTab]);

  // Filter orders based on search term
  const filteredOrders = orders.filter((order) =>
    order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.shopProfile?.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#fff6f1] min-h-screen">
      <div className="bg-white rounded-xl shadow p-4">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-4 border-b border-orange-100">
          <button
            onClick={() => {
              setActiveTab("pickup");
              setPage(1);
            }}
            className={`pb-3 px-2 font-semibold text-sm transition-colors ${
              activeTab === "pickup"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Lấy Thất Bại ({pickupFailedCount})
          </button>
          <button
            onClick={() => {
              setActiveTab("delivery");
              setPage(1);
            }}
            className={`pb-3 px-2 font-semibold text-sm transition-colors ${
              activeTab === "delivery"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Giao Thất Bại ({deliveryFailedCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn, tên người gửi..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full border border-orange-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có đơn hàng nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border border-orange-100">
              <table className="w-full text-sm">
                <thead className="bg-orange-100 text-[#4b1d09] font-semibold text-left">
                  <tr>
                    <th className="text-left p-3">Mã đơn</th>
                    <th className="text-left p-3">Người gửi</th>
                    <th className="text-left p-3">Người nhận</th>
                    <th className="text-left p-3">COD</th>
                    <th className="text-left p-3">Ngày thất bại</th>
                    <th className="text-left p-3">Lần thất bại</th>
                    {activeTab === "delivery" && (
                      <th className="text-left p-3">Trạng thái đơn hàng</th>
                    )}
                    <th className="text-center p-3">Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-orange-100 hover:bg-orange-50 transition-all"
                    >
                      <td className="p-3 font-semibold">{order.code}</td>
                      <td className="p-3">{order.shopProfile?.username || "N/A"}</td>
                      <td className="p-3">{order.receiver_name || "N/A"}</td>
                      <td className="p-3">{(order.cod || 0).toLocaleString('vi-VN')} đ</td>
                      <td className="p-3">{new Date(order.updated_at).toLocaleDateString('vi-VN')}</td>
                      <td className="p-3">
                        {(() => {
                          const failureStatus = activeTab === "pickup" ? "PICKUP_FAILED" : "DELIVERY_FAILED";
                          const failedCount = countFailedShippings(order, failureStatus);
                          return failedCount > 0 ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                              {failedCount} lần
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                              0 lần
                            </span>
                          );
                        })()}
                      </td>
                      {activeTab === "delivery" && (
                        <td className="p-3">
                          {order.order_status === "CANCELED" ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                              Đang hoàn hàng
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                              Đang xử lý
                            </span>
                          )}
                        </td>
                      )}
                      <td className="p-3 text-center space-x-2">
                        <ProtectedComponent perm="order_external_app.can_view_order_details">
                          <button
                          onClick={() => {
                            window.open(`/post-office/orders/history?code=${order.code}`, '_blank');
                          }}
                          className="border border-orange-200 text-orange-700 hover:bg-orange-50 text-sm transition px-3 py-1 rounded-lg items-center gap-1 inline-flex cursor-pointer"
                        >
                          <Visibility fontSize="small" /> Chi tiết
                        </button>
                        </ProtectedComponent>
                        {activeTab === "delivery" && order.order_status !== "CANCELED" && (
                          <button
                            onClick={() => handleReturnOrder(order)}
                            disabled={returningOrderId === order.id}
                            className={`text-sm transition px-3 py-1 rounded-lg items-center gap-1 inline-flex ${
                              returningOrderId === order.id
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
                            }`}
                            title="Hoàn hàng"
                          >
                            <Undo fontSize="small" /> Hoàn hàng
                          </button>
                        )}
                        {/* <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setOpenConfirm(true);
                          }}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg items-center gap-1 inline-flex cursor-pointer"
                        >
                          <Replay fontSize="small" /> Giao lại
                        </button> */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              limit={limit}
              total={total}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          </>
        )}
      </div>

      {/* Hai modal */}
      <OrderDetailModal open={openDetail} onClose={() => setOpenDetail(false)} order={selectedOrder}/>
      <ConfirmResendModal open={openConfirm} onClose={() => setOpenConfirm(false)} order={selectedOrder}/>
    </div>
  );
};

export default FailedOrders;
