import React, { useState, useEffect } from "react";
import { Visibility, CheckCircle, PersonAdd, Search, LocalShipping } from "@mui/icons-material";
import OrderHistoryModal from "../../components/orders/request_orders/OrderHistoryModal";
import ConfirmArrivedModal from "../../components/orders/request_orders/ConfirmArriveModal";
import AssignModal from "../../components/orders/request_orders/AssignModal";
import CreatePlanModal from "../../components/orders/request_orders/CreatePlanModal";
import Pagination from "../../components/common/Pagination";
import { ordersAPI } from "../../api/ordersAPI";
import { nestJSAPI } from "../../api/axiosInstances";
import { toast } from "react-toastify";
import authAPI from "../../api/authAPI";
import { fetchUserPostOfficeId } from "../../api/profileAPI";
import ProtectedComponent from "../../components/common/ProtectedComponent";

const RequestOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openHistory, setOpenHistory] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openCreatePlan, setOpenCreatePlan] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());
  const [planCreating, setPlanCreating] = useState(false);
  const [postOfficeId, setPostOfficeId] = useState(null);

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
      const response = await ordersAPI.getPickupOrders(postOfficeId, page, limit);
      
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
    if (postOfficeId) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postOfficeId, page, limit]);

  // Get status display
  const getStatusDisplay = (order) => {
    if (order.shipping && order.shipping.length > 0) {
      const lastShipping = order.shipping[order.shipping.length - 1];
      if (lastShipping.status === "PICKUP_REQUESTED") {
        return "Đang lấy hàng";
      }
    }
    return "Chờ xử lý";
  };

  // Format time for route step
  const formatRouteStepTime = (routeSteps) => {
    console.log("Route steps:", routeSteps);
    if (!routeSteps || routeSteps.length === 0) {
      return "Chưa có";
    }
    // Get lastest route step
    const lastestStep = routeSteps[routeSteps.length - 1];
    console.log("Latest route step:", lastestStep);
    if (!lastestStep.createdAt) {
      return "Chưa có";
    }
    
    // Parse the ISO date string and convert to Vietnam time (UTC+7)
    const utcDate = new Date(lastestStep.createdAt);
    const vietnamDate = new Date(utcDate.getTime() + 14 * 60 * 60 * 1000);
    
    // Format date as DD/MM/YYYY
    const day = String(vietnamDate.getUTCDate()).padStart(2, '0');
    const month = String(vietnamDate.getUTCMonth() + 1).padStart(2, '0');
    const year = vietnamDate.getUTCFullYear();
    
    // Format time as HH:MM:SS
    const hours = String(vietnamDate.getUTCHours()).padStart(2, '0');
    const minutes = String(vietnamDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(vietnamDate.getUTCSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

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

  // Create plan
  const handleCreatePlan = async (vehicles) => {
    if (selectedOrderIds.size === 0) {
      toast.error("Vui lòng chọn ít nhất một đơn hàng");
      return;
    }

    setPlanCreating(true);
    try {
      const payload = {
        post_office_id: postOfficeId,
        vehicles: parseInt(vehicles, 10),
        order_id_list: Array.from(selectedOrderIds),
        mode: "pickup",
      };

      const response = await nestJSAPI.post('/plan/calculate-route', payload);

      if (response && response.data) {
        toast.success("Tạo kết hoạch giao hàng thành công");
        setSelectedOrderIds(new Set());
        setOpenCreatePlan(false);
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
            onClick={() => setOpenCreatePlan(true)}
            disabled={selectedOrderIds.size === 0 || planCreating}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
              selectedOrderIds.size === 0 || planCreating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer'
            }`}
          >
            <LocalShipping fontSize="small" />
            Tạo kết hoạch ({selectedOrderIds.size})
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
              <table className="w-full text-sm">
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
                    <th className="text-left p-3">Mã đơn</th>
                    <th className="text-left p-3">Người gửi</th>
                    <th className="text-left p-3">Người nhận</th>
                    <th className="text-left p-3">COD</th>
                    <th className="text-left p-3">Trạng thái</th>
                    <th className="text-left p-3">Kế hoạch lấy hàng</th>
                    <th className="text-center p-3">Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-orange-100 hover:bg-orange-50 transition-all"
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
                      <td className="p-3">{order.receiver_name || "N/A"}</td>
                      <td className="p-3">{(order.cod || 0).toLocaleString('vi-VN')} đ</td>
                      <td className="p-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            getStatusDisplay(order) === "Đang lấy hàng"
                              ? "bg-orange-500 text-white"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {getStatusDisplay(order)}
                        </span>
                      </td>
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
                      <td className="p-3 text-center space-x-2">
                        <ProtectedComponent perm="order_external_app.can_view_order_details">
                          <button
                            onClick={() => {
                              window.open(`/post-office/orders/history?code=${order.code}`, '_blank');
                            }}
                            className="border border-orange-200 text-orange-700 hover:bg-orange-50 text-sm transition px-3 py-1 rounded-lg items-center gap-1 inline-flex cursor-pointer"
                          >
                            <Visibility fontSize="small" /> Lịch sử
                          </button>
                        </ProtectedComponent>
                        <ProtectedComponent perm="order_external_app.can_create_order_post_office_association">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setOpenConfirm(true);
                            }}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg items-center gap-1 inline-flex cursor-pointer"
                          >
                            <CheckCircle fontSize="small" /> Xác nhận đã đến
                          </button>
                        </ProtectedComponent>
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

      <OrderHistoryModal open={openHistory} onClose={() => setOpenHistory(false)} order={selectedOrder}/>
      <ConfirmArrivedModal
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        order={selectedOrder}
        onConfirmed={() => {
          setOpenConfirm(false);
          fetchOrders();
        }}
      />
      <CreatePlanModal
        open={openCreatePlan}
        onClose={() => setOpenCreatePlan(false)}
        selectedOrders={orders.filter(o => selectedOrderIds.has(o.id))}
        onCreatePlan={handleCreatePlan}
        loading={planCreating}
      />
    </div>
  );
};

export default RequestOrders;
