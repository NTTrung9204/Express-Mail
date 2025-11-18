import React, { useState } from "react";
import { nestJSAPI, djangoAPI } from "../../../api/axiosInstances";
import { toast } from "react-toastify";

const ConfirmArrivedModal = ({ open, onClose, order, onConfirmed }) => {
  const [processing, setProcessing] = useState(false);

  if (!open || !order) return null;

  const handleConfirm = async () => {
    setProcessing(true);

    try {
      const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      const userId = user?.id;

      if (!userId) {
        toast.error("Không lấy được thông tin người dùng");
        setProcessing(false);
        return;
      }

      // Call Django profile endpoint to get postOfficeId
      const profileRes = await djangoAPI.get(`/api/v1/users/${userId}/profile`);
      const profileData = profileRes.data;

      const postOfficeId = profileData?.postOffice || profileData?.post_office || user?.postOffice;

      if (!postOfficeId) {
        toast.error("Không lấy được bưu cục của người dùng");
        setProcessing(false);
        return;
      }

      const payload = {
        orderId: order.id,
        postOfficeId: String(postOfficeId),
        status: "IN_WAREHOUSE",
      };

      const res = await nestJSAPI.post(`/orders/order-post-office`, payload);

      if (res && res.data) {
        toast.success("Xác nhận thành công");
        if (onConfirmed) onConfirmed();
      } else {
        toast.error("Xác nhận thất bại");
      }
    } catch (error) {
      console.error("ConfirmArrived error:", error);
      toast.error(error.response?.data?.message || "Lỗi khi xác nhận");
    } finally {
      setProcessing(false);
      onClose();
    }
  };

  return (
    <div
      id="confirm-overlay"
      onClick={(e) => e.target.id === "confirm-overlay" && onClose()}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg w-[420px] shadow-lg p-6 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 hover:text-black cursor-pointer"
          disabled={processing}
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold text-[#4b1d09] mb-4">Xác nhận đã đến</h2>
        <p className="text-sm text-gray-600 mb-6">
          Xác nhận rằng đơn <span className="font-semibold text-orange-600">{order.code || order.id}</span> đã đến bưu cục đích?
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
            disabled={processing}
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2"
            disabled={processing}
          >
            {processing ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmArrivedModal;
