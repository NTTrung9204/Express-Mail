import React, { useState, useEffect } from "react";
import { LocalShipping, LocationOn } from "@mui/icons-material";
import { djangoAPI } from "../../../api/axiosInstances";

const OrderDetailModal = ({ open, onClose, order }) => {
  const [postOfficeCache, setPostOfficeCache] = useState({});

  // Fetch post office info when order changes
  useEffect(() => {
    const fetchPostOfficeInfo = async () => {
      if (!order?.transitions) return;

      const transitingTransition = order.transitions.find(t => t.status === "TRANSITING");
      if (!transitingTransition?.nextPostOfficeId) return;

      const poId = transitingTransition.nextPostOfficeId;
      if (postOfficeCache[poId]) return; // Already cached

      try {
        const response = await djangoAPI.get(`/api/v1/post-offices/${poId}`);
        if (response.data) {
          setPostOfficeCache(prev => ({ ...prev, [poId]: response.data }));
        }
      } catch (error) {
        console.error(`Error fetching post office ${poId}:`, error);
      }
    };

    fetchPostOfficeInfo();
  }, [order]);

  if (!open || !order) return null;

  const handleOverlayClick = (e) => {
    if (e.target.id === "modal-overlay") onClose();
  };

  // Get the transiting transition to show next post office
  const transitingTransition = order.transitions?.find(
    (t) => t.status === "TRANSITING"
  );

  // Get current location from orderPostOffices
  const currentPostOffice = order.orderPostOffices?.find(
    (p) => p.postOfficeId === transitingTransition?.currentPostOfficeId
  );

  return (
    <div
      id="modal-overlay"
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div className="bg-[#fff6f1] text-[#4b1d09] rounded-lg w-[600px] shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 hover:text-black cursor-pointer text-xl"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-6">
          Chi tiết đơn hàng đang trung chuyển - <span className="text-orange-700">{order.code}</span>
        </h2>

        {/* Thông tin cơ bản */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-orange-100">
          <h3 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
            <LocalShipping fontSize="small" /> Thông tin đơn hàng
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <p className="font-semibold text-sm text-gray-600">Người gửi</p>
              <p className="text-sm">{order.shopProfile?.username || "N/A"}</p>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-600">Người nhận</p>
              <p className="text-sm">{order.receiver_name || "N/A"}</p>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-600">Điện thoại nhận</p>
              <p className="text-sm">{order.receiver_phone || "N/A"}</p>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-600">COD</p>
              <p className="text-sm font-semibold text-orange-600">
                {(order.cod || 0).toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>
        </div>

        {/* Địa chỉ nhận */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-orange-100">
          <h3 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
            <LocationOn fontSize="small" /> Địa chỉ nhận hàng
          </h3>
          <div className="space-y-2">
            <p className="text-sm">{order.receiver_address || "N/A"}</p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-semibold text-gray-600">Tỉnh/TP</p>
                <p>{order.receiver_province_city || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600">Quận/Huyện</p>
                <p>{order.receiver_district || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600">Phường/Xã</p>
                <p>{order.receiver_ward_commune || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600">Tọa độ</p>
                <p className="text-xs">{order.receiver_coordinate || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin trung chuyển */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-orange-100">
          <h3 className="font-semibold text-orange-700 mb-3">Thông tin trung chuyển</h3>
          <div className="space-y-3">
            {transitingTransition && (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-orange-100">
                  <div>
                    <p className="font-semibold text-sm text-gray-600">Vị trí hiện tại</p>
                    <p className="text-sm">
                      Bưu cục {transitingTransition.currentPostOfficeId || "Chưa xác định"}
                    </p>
                  </div>
                  <div className="text-3xl text-orange-400">→</div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-gray-600">Bưu cục tiếp theo</p>
                    {postOfficeCache[transitingTransition.nextPostOfficeId] ? (
                      <div className="bg-blue-50 p-2 rounded border border-blue-200 space-y-1 mt-1">
                        <p className="font-semibold text-blue-700 text-xs">{postOfficeCache[transitingTransition.nextPostOfficeId].name}</p>
                        <p className="text-gray-600 text-xs">{postOfficeCache[transitingTransition.nextPostOfficeId].address}</p>
                        <p className="text-gray-500 text-xs">ID: {transitingTransition.nextPostOfficeId}</p>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                        Bưu cục {transitingTransition.nextPostOfficeId}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-600">Trạng thái</p>
                  <p className="text-sm">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                      {transitingTransition.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-600">Ngày bắt đầu trung chuyển</p>
                  <p className="text-sm">
                    {new Date(transitingTransition.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        {order.products && order.products.length > 0 && (
          <div className="bg-white rounded-lg p-4 mb-4 border border-orange-100">
            <h3 className="font-semibold text-orange-700 mb-3">Sản phẩm</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {order.products.map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between items-start pb-2 border-b border-orange-100 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{product.name}</p>
                    <p className="text-xs text-gray-600">Số lượng: {product.quantity}</p>
                  </div>
                  <p className="text-xs text-gray-600">{product.weight} kg</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kích thước */}
        <div className="bg-white rounded-lg p-4 border border-orange-100">
          <h3 className="font-semibold text-orange-700 mb-3">Kích thước & Cân nặng</h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-xs font-semibold text-gray-600">Dài</p>
              <p className="text-sm">{order.length || 0} cm</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Rộng</p>
              <p className="text-sm">{order.width || 0} cm</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Cao</p>
              <p className="text-sm">{order.height || 0} cm</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Cân nặng</p>
              <p className="text-sm">{order.weight || 0} kg</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
