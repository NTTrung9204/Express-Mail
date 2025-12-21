import React, { useState, useEffect, useMemo, useRef } from "react";
import { Visibility, LocalShipping, Search, Autorenew } from "@mui/icons-material";
import HistoryModal from "../../components/orders/received_orders/HistoryModal";
import Pagination from "../../components/common/Pagination";
import TransferModal from "../../components/orders/received_orders/TransferModal";
import CreatePlanModal from "../../components/orders/received_orders/CreatePlanModal";
import { ordersAPI } from "../../api/ordersAPI";
import { nestJSAPI } from "../../api/axiosInstances";
import { postOfficeAPI } from "../../api/postOfficeAPI";
import { toast } from "react-toastify";
import authAPI from "../../api/authAPI";
import { fetchUserPostOfficeId } from "../../api/profileAPI";

const ReceivedOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openHistory, setOpenHistory] = useState(false);
  const [openTransfer, setOpenTransfer] = useState(false);
  const [openCreatePlan, setOpenCreatePlan] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState("ready"); // "ready" or "transfer"
  const [readySelectedIds, setReadySelectedIds] = useState(new Set());
  const [transferSelectedIds, setTransferSelectedIds] = useState(new Set());
  const [planCreating, setPlanCreating] = useState(false);
  const [postOfficeId, setPostOfficeId] = useState(null);
  const [postOfficeDetailsMap, setPostOfficeDetailsMap] = useState({});
  const prevPostOfficeIdsRef = useRef(null);

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

  // Fetch orders
  const fetchOrders = async () => {
    if (!postOfficeId) return;

    setLoading(true);
    try {
      const response = await ordersAPI.getReceivedOrders(postOfficeId, page, limit);
      
      if (response.success) {
        setOrders(response.data.data || []);
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
    if (postOfficeId) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postOfficeId, page, limit]);

  // Separate orders into ready and transfer
  const readyOrders = useMemo(() => 
    orders.filter((order) => order.isReadyForDelivery === true),
    [orders]
  );
  
  const transferOrders = useMemo(() => 
    orders.filter((order) => order.isReadyForDelivery !== true),
    [orders]
  );

  // Fetch post office details for transfer orders
  useEffect(() => {
    if (tab === "transfer" && transferOrders.length > 0) {
      const postOfficeIds = [
        ...new Set(transferOrders.map(order => order.nearestPostOfficeId).filter(Boolean))
      ];
      
      // Only fetch if post office IDs have changed
      const postOfficeIdsStr = JSON.stringify(postOfficeIds.sort((a, b) => a - b));
      
      if (postOfficeIds.length > 0 && prevPostOfficeIdsRef.current !== postOfficeIdsStr) {
        prevPostOfficeIdsRef.current = postOfficeIdsStr;
        postOfficeAPI.getMultiplePostOffices(postOfficeIds).then(details => {
          setPostOfficeDetailsMap(details);
        });
      }
    }
  }, [transferOrders, tab]);

  // Filter orders based on search term
  const filteredOrders = (tab === "ready" ? readyOrders : transferOrders).filter((order) =>
    order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.shopProfile?.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle checkbox for ready orders
  const handleCheckReady = (orderId) => {
    const newSelected = new Set(readySelectedIds);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setReadySelectedIds(newSelected);
  };

  // Handle select all for ready orders
  const handleSelectAllReady = () => {
    if (readySelectedIds.size === filteredOrders.length) {
      setReadySelectedIds(new Set());
    } else {
      const allIds = new Set(filteredOrders.map(order => order.id));
      setReadySelectedIds(allIds);
    }
  };

  // Handle checkbox for transfer orders
  const handleCheckTransfer = (orderId) => {
    const newSelected = new Set(transferSelectedIds);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setTransferSelectedIds(newSelected);
  };

  // Handle select all for transfer orders
  const handleSelectAllTransfer = () => {
    if (transferSelectedIds.size === filteredOrders.length) {
      setTransferSelectedIds(new Set());
    } else {
      const allIds = new Set(filteredOrders.map(order => order.id));
      setTransferSelectedIds(allIds);
    }
  };

  // Create delivery plan for ready orders
  const handleCreatePlan = async (vehicles) => {
    const selectedIds = tab === "ready" ? readySelectedIds : transferSelectedIds;
    if (selectedIds.size === 0) {
      toast.error("Vui lòng chọn ít nhất một đơn hàng");
      return;
    }

    setPlanCreating(true);
    try {
      const payload = {
        post_office_id: postOfficeId,
        vehicles: parseInt(vehicles, 10),
        order_id_list: Array.from(selectedIds),
        mode: "delivery",
      };

      const response = await nestJSAPI.post('/plan/calculate-route', payload);

      if (response && response.data) {
        toast.success("Tạo kết hoạch giao hàng thành công");
        if (tab === "ready") {
          setReadySelectedIds(new Set());
        } else {
          setTransferSelectedIds(new Set());
        }
        setOpenCreatePlan(false);
        fetchOrders();
      } else {
        toast.error("Tạo kết hoạch thất bại");
      }
    } catch (error) {
      console.error("Error creating plan:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tạo kết hoạch");
    } finally {
      setPlanCreating(false);
    }
  };

  // Count failed deliveries for an order
  const countFailedDeliveries = (order) => {
    if (!order.shipping || !Array.isArray(order.shipping)) {
      return 0;
    }
    return order.shipping.filter((ship) => ship.status === "DELIVERY_FAILED").length;
  };

  // Get return status text for transfer tab
  const getReturnStatusText = (order) => {
    if (order.order_status === "CANCELED") {
      return "Đang hoàn hàng";
    }
    if (order.order_status === "PENDING") {
      return "Đang xử lý";
    }
    return "Chưa xác định";
  };

  // Format time for route step
  const formatRouteStepTime = (routeSteps) => {
    if (!routeSteps || routeSteps.length === 0) {
      return "Chưa có";
    }
    const lastestStep = routeSteps[routeSteps.length - 1];
    if (!lastestStep.createdAt) {
      return "Chưa có";
    }
    
    const utcDate = new Date(lastestStep.createdAt);
    const vietnamDate = new Date(utcDate.getTime() + 14 * 60 * 60 * 1000);
    
    const day = String(vietnamDate.getUTCDate()).padStart(2, '0');
    const month = String(vietnamDate.getUTCMonth() + 1).padStart(2, '0');
    const year = vietnamDate.getUTCFullYear();
    
    const hours = String(vietnamDate.getUTCHours()).padStart(2, '0');
    const minutes = String(vietnamDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(vietnamDate.getUTCSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const currentSelectedIds = tab === "ready" ? readySelectedIds : transferSelectedIds;

  return (
    <div className="bg-[#fff6f1] min-h-screen">
      <div className="bg-white rounded-xl shadow p-4">
        {/* Tabs */}
        <div className="flex gap-4 mb-4 border-b border-orange-200">
          <button
            onClick={() => {
              setTab("ready");
              setSearchTerm("");
              setPage(1);
            }}
            className={`px-4 py-2 font-medium transition ${
              tab === "ready"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Sẵn sàng giao ({readyOrders.length})
          </button>
          <button
            onClick={() => {
              setTab("transfer");
              setSearchTerm("");
              setPage(1);
            }}
            className={`px-4 py-2 font-medium transition ${
              tab === "transfer"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Cần trung chuyển ({transferOrders.length})
          </button>
        </div>

        {/* Search and action bar */}
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
            onClick={() => {
              if (tab === "transfer") {
                setOpenTransfer(true);
              } else {
                setOpenCreatePlan(true);
              }
            }}
            disabled={currentSelectedIds.size === 0 || planCreating}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
              currentSelectedIds.size === 0 || planCreating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : tab === "ready"
                ? 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer'
                : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
            }`}
          >
            {tab === "ready" ? (
              <>
                <LocalShipping fontSize="small" />
                Tạo đợt giao ({currentSelectedIds.size})
              </>
            ) : (
              <>
                <Autorenew fontSize="small" />
                Phân loại ({currentSelectedIds.size})
              </>
            )}
          </button>
        </div>

        {/* Orders table */}
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
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-orange-100 text-[#4b1d09] font-semibold text-left">
                    <th className="p-3 w-12">
                      <input
                        type="checkbox"
                        checked={currentSelectedIds.size === filteredOrders.length && filteredOrders.length > 0}
                        onChange={tab === "ready" ? handleSelectAllReady : handleSelectAllTransfer}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="p-3 border-b border-orange-200">Mã đơn</th>
                    <th className="p-3 border-b border-orange-200">Người gửi</th>
                    <th className="p-3 border-b border-orange-200">Người nhận</th>
                    <th className="p-3 border-b border-orange-200">Phí vận chuyển</th>
                    {tab === "transfer" && (
                      <th className="p-3 border-b border-orange-200">Bưu cục tiếp theo</th>
                    )}
                    <th className="p-3 border-b border-orange-200">Lần giao thất bại</th>
                    {tab !== "transfer" && (
                      <th className="p-3 border-b border-orange-200">Trạng thái đơn hàng</th>
                    )}
                    {tab !== "transfer" && (
                      <th className="p-3 border-b border-orange-200">Kế hoạch giao hàng</th>
                    )}
                    {tab === "transfer" && (
                      <th className="p-3 border-b border-orange-200">Trạng thái đơn hàng</th>
                    )}
                    <th className="p-3 border-b border-orange-200 text-center">
                      Hành động
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order, i) => (
                    <tr
                      key={i}
                      className={`hover:bg-orange-50 transition ${
                        i !== filteredOrders.length - 1 ? "border-b border-orange-100" : ""
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={currentSelectedIds.has(order.id)}
                          onChange={tab === "ready" ? () => handleCheckReady(order.id) : () => handleCheckTransfer(order.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-semibold">{order.code}</td>
                      <td className="p-3">{order.shopProfile?.username || "N/A"}</td>
                      <td className="p-3">
                        {order.receiver_name || "N/A"}
                      </td>
                      <td className="p-3">{(order.shipping_cost || 0).toLocaleString('vi-VN')} đ</td>
                      {tab === "transfer" && (
                        <td className="p-3 text-xs">
                          <span className="text-blue-600">
                            {postOfficeDetailsMap[order.nearestPostOfficeId]?.name || `PO #${order.nearestPostOfficeId}`}
                          </span>
                          <div className="text-gray-500 mt-1">
                            {order.distanceToReceiver?.toFixed(2)} km
                          </div>
                        </td>
                      )}
                      <td className="p-3">
                        {(() => {
                          const failedCount = countFailedDeliveries(order);
                          return failedCount > 0 ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                              {failedCount} lần
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                              0 lần
                            </span>
                          );
                        })()}
                      </td>
                      {tab !== "transfer" && (
                        <td className="p-3">
                          {order.order_status === "CANCELED" ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                              Đang hoàn hàng
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                              Đang xử lý
                            </span>
                          )}
                        </td>
                      )}
                      {tab !== "transfer" && (
                        <td className="p-3">
                          {order.routeSteps && order.routeSteps.length > 0 ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                              {formatRouteStepTime(order.routeSteps)}
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                              Chưa có
                            </span>
                          )}
                        </td>
                      )}
                      {tab === "transfer" && (
                        <td className="p-3">
                          {order.order_status === "CANCELED" ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                              Đang hoàn hàng
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                              Đang xử lý
                            </span>
                          )}
                        </td>
                      )}
                      <td className="p-3 text-center items-center">
                        <button
                          onClick={() => {
                            window.open(`/post-office/orders/history?code=${order.code}`, '_blank');
                          }}
                          className="flex items-center gap-1 px-3 py-1 border border-orange-200 rounded-lg text-orange-700 hover:bg-orange-50 text-sm transition cursor-pointer"
                          title="Xem lịch sử"
                        >
                          <Visibility fontSize="small" />
                          <span>Lịch sử</span>
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
              total={tab === "ready" ? readyOrders.length : transferOrders.length}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          </>
        )}
      </div>

      <HistoryModal open={openHistory} onClose={() => setOpenHistory(false)} order={selectedOrder} />
      <CreatePlanModal
        open={openCreatePlan}
        onClose={() => setOpenCreatePlan(false)}
        selectedOrders={filteredOrders.filter(o => currentSelectedIds.has(o.id))}
        onCreatePlan={handleCreatePlan}
        loading={planCreating}
        isTransfer={tab === "transfer"}
      />
      <TransferModal
        open={openTransfer}
        onClose={() => setOpenTransfer(false)}
        selectedOrders={filteredOrders.filter(o => transferSelectedIds.has(o.id))}
        currentPostOfficeId={postOfficeId}
        onTransferComplete={() => {
          setTransferSelectedIds(new Set());
          setOpenTransfer(false);
          fetchOrders();
        }}
      />
    </div>
  );
};

export default ReceivedOrders;
