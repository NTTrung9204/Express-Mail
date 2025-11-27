import React, { useState, useEffect } from 'react';
import { Info, LocationOn } from '@mui/icons-material';
import { nestJSAPI, djangoAPI } from '../../../api/axiosInstances';
import { toast } from 'react-toastify';

const TransferModal = ({ open, onClose, selectedOrders, currentPostOfficeId, onTransferComplete }) => {
  const [processing, setProcessing] = useState(false);
  const [postOffices, setPostOffices] = useState({});
  const [loading, setLoading] = useState(true);

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

            <div className="space-y-3">
              {selectedOrders.map((order) => {
                const nextPO = postOffices[order.nearestPostOfficeId];
                return (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{order.code}</p>
                        <p className="text-xs text-gray-500">{order.shopProfile?.username}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                        {order.cod?.toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <LocationOn fontSize="small" className="text-red-500" />
                      <span className="text-gray-600">
                        Bưu cục hiện tại: <span className="font-medium">PO #{currentPostOfficeId}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm mt-2">
                      <LocationOn fontSize="small" className="text-green-600" />
                      <span className="text-gray-600">
                        Bưu cục tiếp theo: 
                        {nextPO ? (
                          <>
                            <span className="font-medium"> {nextPO.name}</span>
                            <span className="text-gray-500 text-xs ml-1">
                              ({nextPO.address})
                            </span>
                          </>
                        ) : (
                          <span className="font-medium"> PO #{order.nearestPostOfficeId}</span>
                        )}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mt-2">
                      Khoảng cách: {order.nearestPostOfficeDistance?.toFixed(2)} km
                    </div>
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
