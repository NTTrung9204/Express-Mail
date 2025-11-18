import React, { useState, useEffect } from "react";
import { Visibility, Replay, Search } from "@mui/icons-material";
import OrderDetailModal from "../../components/orders/failed_orders/OrderDetailModal";
import ConfirmResendModal from "../../components/orders/failed_orders/ConfirmResendModal";
import Pagination from "../../components/common/Pagination";
import { ordersAPI } from "../../api/ordersAPI";
import { toast } from "react-toastify";
import authAPI from "../../api/authAPI";

const FailedOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
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
      const response = await ordersAPI.getFailedOrders(postOfficeId, page, limit);
      
      if (response.success) {
        setOrders(response.data.data || []);
        setTotal(response.data.total || 0);
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

  const mockOrders = [
    {
      id: "PO123460",
      sender: "Nguyễn Văn X",
      receiver: "Trần Thị Y",
      phone: "0901234567",
      cod: "500.000 đ",
      reason: "Không liên lạc được",
      date: "2024-03-15",
    },
    {
      id: "PO123461",
      sender: "Lê Văn Z",
      receiver: "Phạm Thị W",
      phone: "0902234567",
      cod: "750.000 đ",
      reason: "Địa chỉ không chính xác",
      date: "2024-03-14",
    },
  ];

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
                    <th className="text-left p-3">Lý do thất bại</th>
                    <th className="text-left p-3">Ngày thất bại</th>
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
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {order.shipping_status || "Không xác định"}
                        </span>
                      </td>
                      <td className="p-3">{new Date(order.updated_at).toLocaleDateString('vi-VN')}</td>
                      <td className="p-3 text-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setOpenDetail(true);
                          }}
                          className="border border-orange-200 text-orange-700 hover:bg-orange-50 text-sm transition px-3 py-1 rounded-lg items-center gap-1 inline-flex cursor-pointer"
                        >
                          <Visibility fontSize="small" /> Chi tiết
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setOpenConfirm(true);
                          }}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg items-center gap-1 inline-flex cursor-pointer"
                        >
                          <Replay fontSize="small" /> Giao lại
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

      {/* Hai modal */}
      <OrderDetailModal open={openDetail} onClose={() => setOpenDetail(false)} order={selectedOrder}/>
      <ConfirmResendModal open={openConfirm} onClose={() => setOpenConfirm(false)} order={selectedOrder}/>
    </div>
  );
};

export default FailedOrders;
