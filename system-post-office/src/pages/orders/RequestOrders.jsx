import React, { useState, useEffect } from "react";
import { Visibility, CheckCircle, PersonAdd, Search } from "@mui/icons-material";
import OrderHistoryModal from "../../components/orders/request_orders/OrderHistoryModal";
import ConfirmArrivedModal from "../../components/orders/request_orders/ConfirmArriveModal";
import AssignModal from "../../components/orders/request_orders/AssignModal";
import Pagination from "../../components/common/Pagination";
import { ordersAPI } from "../../api/ordersAPI";
import { toast } from "react-toastify";
import authAPI from "../../api/authAPI";

const RequestOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openHistory, setOpenHistory] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Get post office ID from user data
  const user = authAPI.getUser();
  const postOfficeId = user?.postOffice || 1;

  // Fetch orders
  const fetchOrders = async () => {
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
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

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

  // Filter orders based on search term
  const filteredOrders = orders.filter((order) =>
    order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.shopProfile?.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#fff6f1] min-h-screen">
      <div className="bg-white rounded-xl shadow p-4">
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
                    <th className="text-left p-3">Trạng thái</th>
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
                      <td className="p-3">Anonymous</td>
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
                      <td className="p-3 text-center space-x-2">
                        <button
                          onClick={() => {
                            window.open(`/post-office/orders/history?code=${order.code}`, '_blank');
                          }}
                          className="border border-orange-200 text-orange-700 hover:bg-orange-50 text-sm transition px-3 py-1 rounded-lg items-center gap-1 inline-flex cursor-pointer"
                        >
                          <Visibility fontSize="small" /> Lịch sử
                        </button>

                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setOpenConfirm(true);
                          }}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg items-center gap-1 inline-flex cursor-pointer"
                        >
                          <CheckCircle fontSize="small" /> Xác nhận đã đến
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
    </div>
  );
};

export default RequestOrders;
