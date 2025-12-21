import React, { useState, useEffect } from "react";
import { Visibility, Search } from "@mui/icons-material";
import OrderDetailModal from "../../components/orders/transiting_orders/OrderDetailModal";
import Pagination from "../../components/common/Pagination";
import { ordersAPI } from "../../api/ordersAPI";
import { djangoAPI } from "../../api/axiosInstances";
import { toast } from "react-toastify";
import authAPI from "../../api/authAPI";
import { fetchUserPostOfficeId } from "../../api/profileAPI";

const TransitingOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [postOfficeId, setPostOfficeId] = useState(null);
  const [postOfficeCache, setPostOfficeCache] = useState({});

  // Fetch post office info when orders change
  useEffect(() => {
    const fetchPostOfficeInfo = async () => {
      if (!orders || orders.length === 0) return;

      // Get unique post office IDs
      const postOfficeIds = new Set();
      orders.forEach(order => {
        const transitingTransition = order.transitions?.findLast(t => t.status === "TRANSITING");
        if (transitingTransition?.nextPostOfficeId) {
          postOfficeIds.add(transitingTransition.nextPostOfficeId);
        }
      });

      // Fetch info for post offices not in cache
      const newCache = { ...postOfficeCache };
      for (const id of postOfficeIds) {
        if (!newCache[id]) {
          try {
            const response = await djangoAPI.get(`/api/v1/post-offices/${id}`);
            if (response.data) {
              newCache[id] = response.data;
            }
          } catch (error) {
            console.error(`Error fetching post office ${id}:`, error);
          }
        }
      }
      setPostOfficeCache(newCache);
    };

    fetchPostOfficeInfo();
  }, [orders]);

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
      const response = await ordersAPI.getTransitingOrders(postOfficeId, page, limit);
      
      if (response.success) {
        setOrders(response.data.data || []);
        setTotal(response.data.meta?.total || 0);
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

  // Filter orders based on search term
  const filteredOrders = orders.filter((order) =>
    order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.shopProfile?.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get next post office ID from transitions
  const getNextPostOfficeId = (order) => {
    const transitingTransition = order.transitions?.findLast(
      (t) => t.status === "TRANSITING"
    );
    return transitingTransition?.nextPostOfficeId || "N/A";
  };

  // Helper function to get post office details
  const getPostOfficeDetails = (order) => {
    const transitingTransition = order.transitions?.findLast(
      (t) => t.status === "TRANSITING"
    );
    const postOfficeId = transitingTransition?.nextPostOfficeId;
    return postOfficeCache[postOfficeId] || null;
  };

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
            <p className="text-gray-500">Không có đơn hàng nào đang trung chuyển</p>
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
                    <th className="text-left p-3">Địa chỉ nhận</th>
                    <th className="text-left p-3">COD</th>
                    <th className="text-left p-3">Bưu cục tiếp theo</th>
                    <th className="text-left p-3">Ngày gửi</th>
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
                      <td className="p-3 text-xs max-w-xs truncate">
                        {order.receiver_address || "N/A"}
                      </td>
                      <td className="p-3">{(order.cod || 0).toLocaleString('vi-VN')} đ</td>
                      <td className="p-3">
                        {(() => {
                          const poDetails = getPostOfficeDetails(order);
                          if (poDetails) {
                            return (
                                <p className="font-semibold text-blue-700 text-xs">{poDetails.name}</p>
                            );
                          } else {
                            return (
                              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold">
                                {getNextPostOfficeId(order)}
                              </span>
                            );
                          }
                        })()}
                      </td>
                      <td className="p-3 text-xs">
                        {new Date(order.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            window.open(`/post-office/orders/history?code=${order.code}`, '_blank');
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

            {total > limit && (
              <div className="mt-4">
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(total / limit)}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          open={openDetail}
          onClose={() => {
            setOpenDetail(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default TransitingOrders;
