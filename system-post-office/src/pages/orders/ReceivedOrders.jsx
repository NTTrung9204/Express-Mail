import React, { useState, useEffect } from "react";
import { Visibility, AssignmentInd, Search } from "@mui/icons-material";
import HistoryModal from "../../components/orders/received_orders/HistoryModal";
import AssignModal from "../../components/orders/received_orders/AssignModal";
import Pagination from "../../components/common/Pagination";
import { ordersAPI } from "../../api/ordersAPI";
import { toast } from "react-toastify";
import authAPI from "../../api/authAPI";

const ReceivedOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openHistory, setOpenHistory] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
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
      const response = await ordersAPI.getReceivedOrders(postOfficeId, page, limit);
      
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

  const mockOrders = [
    {
      code: "PO123456",
      sender: "Nguyễn Văn A",
      receiver: "Trần Thị B",
      phone: "0901234567",
      cod: "500.000 đ",
      fee: "50.000 đ",
      status: "Trong kho",
    },
    {
      code: "PO123457",
      sender: "Lê Văn C",
      receiver: "Phạm Thị D",
      phone: "0902234567",
      cod: "750.000 đ",
      fee: "60.000 đ",
      status: "Đang vận chuyển",
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
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-orange-100 text-[#4b1d09] font-semibold text-left">
                    <th className="p-3 border-b border-orange-200">Mã đơn</th>
                    <th className="p-3 border-b border-orange-200">Người gửi</th>
                    <th className="p-3 border-b border-orange-200">Người nhận</th>
                    <th className="p-3 border-b border-orange-200">COD</th>
                    <th className="p-3 border-b border-orange-200">Phí vận chuyển</th>
                    <th className="p-3 border-b border-orange-200">Trạng thái</th>
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
                      <td className="p-3 font-semibold">{order.code}</td>
                      <td className="p-3">{order.shopProfile?.username || "N/A"}</td>
                      <td className="p-3">
                        Anonymous
                        <div className="text-xs text-gray-500">-</div>
                      </td>
                      <td className="p-3">{(order.cod || 0).toLocaleString('vi-VN')} đ</td>
                      <td className="p-3">{(order.shipping_cost || 0).toLocaleString('vi-VN')} đ</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.shipping_status === "RECEIVED"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {order.shipping_status === "RECEIVED" ? "Trong kho" : "Đang vận chuyển"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setOpenHistory(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1 border border-orange-200 rounded-lg text-orange-700 hover:bg-orange-50 text-sm transition cursor-pointer"
                            title="Xem lịch sử"
                          >
                            <Visibility fontSize="small" />
                            <span>Lịch sử</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setOpenAssign(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm transition cursor-pointer"
                            title="Phân công"
                          >
                            <AssignmentInd fontSize="small" />
                            <span>Phân công</span>
                          </button>
                        </div>
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

      <HistoryModal open={openHistory} onClose={() => setOpenHistory(false)} order={selectedOrder} />
      <AssignModal open={openAssign} onClose={() => setOpenAssign(false)} order={selectedOrder} />
    </div>
  );
};

export default ReceivedOrders;
