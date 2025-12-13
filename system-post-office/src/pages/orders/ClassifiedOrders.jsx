import React, { useState, useEffect } from "react";
import { Search, Visibility, SwapHoriz } from "@mui/icons-material";
import OrderDetailModal from "../../components/orders/classified_orders/OrderDetailModal";
import Pagination from "../../components/common/Pagination";
import { ordersAPI } from "../../api/ordersAPI";
import { nestJSAPI } from "../../api/axiosInstances";
import { toast } from "react-toastify";
import authAPI from "../../api/authAPI";

const ClassifiedOrders = () => {
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());
  const [transitionProcessing, setTransitionProcessing] = useState(false);

  // Get post office ID from user data
  const user = authAPI.getUser();
  const postOfficeId = user?.postOffice || 1;

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getClassifiedOrders(postOfficeId, page, limit);
      
      if (response.success) {
        setOrders(response.data.data || []);
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

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // Filter orders based on search term
  const filteredOrders = orders.filter((order) =>
    order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.shopProfile?.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle individual checkbox
  const handleCheckOrder = (orderId) => {
    const newSelected = new Set(selectedOrderIds);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrderIds(newSelected);
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedOrderIds.size === filteredOrders.length) {
      setSelectedOrderIds(new Set());
    } else {
      const allIds = new Set(filteredOrders.map(order => order.id));
      setSelectedOrderIds(allIds);
    }
  };

  // Transition orders to next post office
  const handleTransitionOrders = async () => {
    if (selectedOrderIds.size === 0) {
      toast.error("Vui lòng chọn ít nhất một đơn hàng");
      return;
    }

    setTransitionProcessing(true);
    let successCount = 0;
    const selectedOrdersList = orders.filter(o => selectedOrderIds.has(o.id));

    for (const order of selectedOrdersList) {
      try {
        const payload = {
          orderId: order.id,
          currentPostOfficeId: String(postOfficeId),
          nextPostOfficeId: String(order.nearestPostOfficeId),
          status: "TRANSITING",
        };

        const res = await nestJSAPI.post("/orders/transition-order", payload);
        if (res && res.data) {
          successCount++;
        }
      } catch (error) {
        console.error(`Error transitioning order ${order.id}:`, error);
      }
    }

    if (successCount === selectedOrderIds.size) {
      toast.success(`Trung chuyển ${successCount} đơn hàng thành công`);
      setSelectedOrderIds(new Set());
      fetchOrders();
    } else if (successCount > 0) {
      toast.warning(`Trung chuyển ${successCount}/${selectedOrderIds.size} đơn hàng`);
      setSelectedOrderIds(new Set());
      fetchOrders();
    } else {
      toast.error("Trung chuyển thất bại");
    }

    setTransitionProcessing(false);
  };

  return (
    <div className="bg-[#fff6f1] min-h-screen">
      <div className="bg-white rounded-xl shadow p-4">
        <div className="mb-4 flex gap-3">
          <div className="relative flex-1">
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
          <button
            onClick={handleTransitionOrders}
            disabled={selectedOrderIds.size === 0 || transitionProcessing}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
              selectedOrderIds.size === 0 || transitionProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
            }`}
          >
            <SwapHoriz fontSize="small" />
            Trung chuyển ({selectedOrderIds.size})
          </button>
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
              <table className="w-full text-sm border-collapse">
                <thead className="bg-orange-100 text-[#4b1d09] font-semibold text-left">
                  <tr>
                    <th className="p-3 w-12">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="p-3">Mã đơn</th>
                    <th className="p-3">Người gửi</th>
                    <th className="p-3">Người nhận</th>
                    <th className="p-3">Tỉnh/Thành nhận</th>
                    <th className="p-3">Bưu cục tiếp theo</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3">Ngày phân loại</th>
                    <th className="p-3 text-center">Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 hover:bg-orange-50 transition"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.has(order.id)}
                          onChange={() => handleCheckOrder(order.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-semibold">{order.code}</td>
                      <td className="p-3">{order.shopProfile?.username || "N/A"}</td>
                      <td className="p-3">Anonymous</td>
                      <td className="p-3">{order.receiver_province_city || "N/A"}</td>
                      <td className="p-3 text-xs">
                        <span className="text-blue-600">
                          PO #{order.nearestPostOfficeId}
                        </span>
                        <div className="text-gray-500 mt-1">
                          {order.distanceToReceiver?.toFixed(2)} km
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            order.shipping_status === "CLASSIFIED"
                              ? "bg-orange-500 text-white"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {order.shipping_status === "CLASSIFIED" ? "Đã phân loại" : "Trong kho"}
                        </span>
                      </td>
                      <td className="p-3 text-gray-700">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setOpenDetail(true);
                          }}
                          className="border border-orange-200 text-orange-700 hover:bg-orange-50 text-sm transition px-3 py-1 rounded-lg items-center gap-1 inline-flex cursor-pointer"
                        >
                          <Visibility fontSize="small" /> Chi tiết
                        </button>
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

      {openDetail && (
        <OrderDetailModal open={openDetail} onClose={() => setOpenDetail(false)} order={selectedOrder}/>
      )}
    </div>
  );
};

export default ClassifiedOrders;
