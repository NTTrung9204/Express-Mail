import React, { useState, useEffect } from 'react';
import { Info, LocationOn, ExpandLess, ExpandMore } from '@mui/icons-material';
import { nestJSAPI, djangoAPI } from '../../../api/axiosInstances';
import { toast } from 'react-toastify';

const TransferModal = ({ open, onClose, selectedOrders, onTransferComplete }) => {
  const [processing, setProcessing] = useState(false);
  const [postOffices, setPostOffices] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedPostOffices, setExpandedPostOffices] = useState({});

  const togglePostOfficeExpand = (poId) => {
    setExpandedPostOffices(prev => ({
      ...prev,
      [poId]: !prev[poId]
    }));
  };

  useEffect(() => {
    if (open && selectedOrders.length > 0) {
      fetchPostOfficeDetails();
    }
  }, [open, selectedOrders]);

  const fetchPostOfficeDetails = async () => {
    setLoading(true);
    try {
      const response = await djangoAPI.get("/api/v1/post-offices");
      if (response.data && response.data.results) {
        const poMap = {};
        response.data.results.forEach((po) => {
          poMap[po.id] = po;
        });
        setPostOffices(poMap);
      }
    } catch (error) {
      console.error("Error fetching post offices:", error);
      toast.error("Lỗi khi lấy thông tin bưu cục");
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    setProcessing(true);
    try {
      const user = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null;
      const userId = user?.id;

      if (!userId) {
        toast.error("Không lấy được thông tin người dùng");
        setProcessing(false);
        return;
      }

      // Get current user's post office
      const profileRes = await djangoAPI.get(`/api/v1/users/${userId}/profile`);
      const profileData = profileRes.data;
      const userPostOfficeId = profileData?.postOffice || profileData?.post_office || user?.postOffice;

      if (!userPostOfficeId) {
        toast.error("Không lấy được bưu cục của người dùng");
        setProcessing(false);
        return;
      }

      // Transition each order
      let successCount = 0;
      for (const order of selectedOrders) {
        try {
          const payload = {
            orderId: order.id,
            currentPostOfficeId: String(userPostOfficeId),
            nextPostOfficeId: String(order.nearestPostOfficeId),
            status: "PENDING",
          };

          const res = await nestJSAPI.post("/orders/transition-order", payload);
          if (res && res.data) {
            successCount++;
          }
        } catch (error) {
          console.error(`Error transitioning order ${order.id}:`, error);
        }
      }

      if (successCount === selectedOrders.length) {
        toast.success(`Phân loại ${successCount} đơn hàng thành công`);
        onTransferComplete();
      } else if (successCount > 0) {
        toast.warning(`Phân loại ${successCount}/${selectedOrders.length} đơn hàng`);
        onTransferComplete();
      } else {
        toast.error("Phân loại thất bại");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error(error.response?.data?.message || "Lỗi khi phân loại");
    } finally {
      setProcessing(false);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      id="transfer-overlay"
      onClick={(e) => e.target.id === "transfer-overlay" && !processing && onClose()}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg w-[600px] shadow-lg p-6 relative max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 hover:text-black cursor-pointer"
          disabled={processing}
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold text-[#4b1d09] mb-4">
          Phân loại đơn hàng cần trung chuyển
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Đang tải thông tin...</p>
          </div>
        ) : selectedOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có đơn hàng được chọn</p>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex gap-2">
              <Info className="text-blue-600 flex-shrink-0" fontSize="small" />
              <p className="text-sm text-blue-800">
                Các đơn hàng sẽ được chuyển đến bưu cục gần nhất với người nhận
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(
                selectedOrders.reduce((grouped, order) => {
                  const poId = order.nearestPostOfficeId;
                  if (!grouped[poId]) {
                    grouped[poId] = [];
                  }
                  grouped[poId].push(order);
                  return grouped;
                }, {})
              ).map(([poId, orders]) => {
                const nextPO = postOffices[poId];
                return (
                  <div
                    key={poId}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div
                      onClick={() => togglePostOfficeExpand(poId)}
                      className="flex items-center gap-2 mb-3 cursor-pointer hover:bg-gray-100 -mx-4 -mt-4 px-4 py-3 rounded-t-lg transition-colors"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePostOfficeExpand(poId);
                        }}
                        className="flex-shrink-0 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                      >
                        {expandedPostOffices[poId] ? (
                          <ExpandLess fontSize="small" />
                        ) : (
                          <ExpandMore fontSize="small" />
                        )}
                      </button>
                      <LocationOn fontSize="small" className="text-green-600" />
                      <div className="flex-1">
                        {nextPO ? (
                          <>
                            <p className="font-semibold text-gray-800">{nextPO.name}</p>
                            <p className="text-xs text-gray-500">{nextPO.address}</p>
                          </>
                        ) : (
                          <p className="font-semibold text-gray-800">PO #{poId}</p>
                        )}
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                        {orders.length} đơn
                      </span>
                    </div>

                    {expandedPostOffices[poId] && (
                      <div className="space-y-2 pl-4">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="bg-white border border-gray-200 rounded p-2 flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{order.code}</p>
                              <p className="text-xs text-gray-500">{order.shopProfile?.username}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded block mb-1">
                                {order.cod?.toLocaleString('vi-VN')} đ
                              </span>
                              <p className="text-xs text-gray-500">
                                {order.distanceToReceiver?.toFixed(2)} km
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
                disabled={processing}
              >
                Hủy
              </button>
              <button
                onClick={handleTransfer}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
                disabled={processing}
              >
                {processing ? "Đang xử lý..." : `Phân loại (${selectedOrders.length})`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TransferModal;
