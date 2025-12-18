import React, { useState, useEffect } from "react";
import { Close, Person } from "@mui/icons-material";
import shippersAPI from "../../../api/shippersAPI";
import plansAPI from "../../../api/plansAPI";
import { toast } from "react-toastify";

const AssignShipperModal = ({ open, onClose, vehicleRouteId, postOfficeId, onAssignSuccess }) => {
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedShipperId, setSelectedShipperId] = useState(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (open && postOfficeId) {
      fetchShippers();
    }
  }, [open, postOfficeId]);

  const fetchShippers = async () => {
    setLoading(true);
    try {
      const response = await shippersAPI.getShippers(postOfficeId, 1, 100);
      if (response.success) {
        setShippers(response.data);
        setSelectedShipperId(null);
      } else {
        toast.error(response.message || "Không thể lấy danh sách shipper");
      }
    } catch (error) {
      console.error("Error fetching shippers:", error);
      toast.error("Lỗi khi lấy danh sách shipper");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedShipperId) {
      toast.error("Vui lòng chọn một shipper");
      return;
    }

    setAssigning(true);
    try {
      const response = await plansAPI.assignVehicleRoutes([
        {
          vehicle_route_id: vehicleRouteId,
          shipper_id: String(selectedShipperId),
        },
      ]);

      console.log("Assign shipper response:", response);

      if (response.success) {
        toast.success("Phân công shipper thành công");
        onClose();
        if (onAssignSuccess) {
          onAssignSuccess();
        }
      } else {
        toast.error("Phân công shipper thất bại");
      }
    } catch (error) {
      console.error("Error assigning shipper:", error);
      toast.error(error.response?.data?.message || "Lỗi khi phân công shipper");
    } finally {
      setAssigning(false);
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={(e) => e.target.id === "assign-modal-overlay" && !assigning && onClose()}
      id="assign-modal-overlay"
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-xl w-[500px] shadow-lg p-6 relative">
        <button
          onClick={onClose}
          disabled={assigning}
          className="absolute top-4 right-4 text-gray-600 hover:text-black cursor-pointer disabled:opacity-50"
        >
          <Close />
        </button>

        <h2 className="text-2xl font-bold text-[#4b1d09] mb-4">Gán Shipper</h2>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Đang tải danh sách shipper...</p>
          </div>
        ) : shippers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có shipper nào</p>
          </div>
        ) : (
          <>
            <div className="mb-6 max-h-[400px] overflow-y-auto border border-orange-200 rounded-lg p-3">
              {shippers.map((shipper) => (
                <label
                  key={shipper.email}
                  className="flex items-center p-3 hover:bg-orange-50 rounded cursor-pointer transition"
                >
                  <input
                    type="radio"
                    name="shipper"
                    value={String(shipper.id)}
                    checked={selectedShipperId === String(shipper.id)}
                    onChange={(e) => setSelectedShipperId(e.target.value)} 
                    className="w-4 h-4 cursor-pointer"
                  />
                  <Person className="ml-3 text-orange-600" fontSize="small" />
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-[#4b1d09]">
                      {shipper.firstName} {shipper.lastName}
                    </p>
                    <p className="text-xs text-gray-600">{shipper.email}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={assigning}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-sm disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedShipperId || assigning}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {assigning ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Đang gán...
                  </>
                ) : (
                  "Gán shipper"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AssignShipperModal;
