import React, { useState, useEffect } from "react";
import { Close, Navigation } from "@mui/icons-material";
import plansAPI from "../../../api/plansAPI";
import shippersAPI from "../../../api/shippersAPI";
import { toast } from "react-toastify";

const RouteDetailModal = ({ open, onClose, vehicleRouteId, mode = "delivery" }) => {
  const [vehicleRoute, setVehicleRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shipperName, setShipperName] = useState(null);

  useEffect(() => {
    if (open && vehicleRouteId) {
      fetchVehicleRoute();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vehicleRouteId]);

  const fetchVehicleRoute = async () => {
    setLoading(true);
    try {
      const response = await plansAPI.getVehicleRoute(vehicleRouteId);
      if (response.success) {
        const route = response.data.vehicleRoute;
        setVehicleRoute(route);

        // Fetch shipper name if shipperId exists
        if (route.vehicleId) {
          await fetchShipperName(route.vehicleId, route.routePlan.postOfficeId);
        } else {
          setShipperName(null);
        }
      } else {
        toast.error("Không thể lấy thông tin tuyến đường");
      }
    } catch (error) {
      console.error("Error fetching vehicle route:", error);
      toast.error("Lỗi khi lấy thông tin tuyến đường");
    } finally {
      setLoading(false);
    }
  };

  const fetchShipperName = async (shipperId, postOfficeId) => {
    try {
      const response = await shippersAPI.getShippers(postOfficeId, 1, 100);
      if (response.success && response.data.length > 0) {
        console.log("Shippers data:", response.data);
        const shipper = response.data.find(s => s.id == shipperId);
        if (shipper) {
          setShipperName(`${shipper.firstName} ${shipper.lastName}`);
        } else {
          setShipperName(`Shipper #${shipperId}`);
        }
      } else {
        setShipperName(`Shipper #${shipperId}`);
      }
    } catch (error) {
      console.error("Error fetching shipper name:", error);
      setShipperName(`Shipper #${shipperId}`);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const formatDistance = (distance) => {
    return (distance / 1000).toFixed(2);
  };

  if (!open) return null;

  return (
    <div
      onClick={(e) => e.target.id === "route-modal-overlay" && onClose()}
      id="route-modal-overlay"
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-xl w-[900px] shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black cursor-pointer"
        >
          <Close />
        </button>

        <h2 className="text-2xl font-bold text-[#4b1d09] mb-6">Chi tiết tuyến đường {mode === "pickup" ? "lấy hàng" : "giao hàng"}</h2>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : vehicleRoute ? (
          <>
            {/* Route Statistics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-xs text-gray-600 mb-1">Tổng khoảng cách</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatDistance(vehicleRoute.distance)} km
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-xs text-gray-600 mb-1">Shipper</p>
                <p className="text-xl font-bold text-orange-600">
                  {shipperName ? shipperName : vehicleRoute.vehicleId ? `Xe ${vehicleRoute.vehicleId}` : "Chưa gán"}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-xs text-gray-600 mb-1">Số điểm {mode === "pickup" ? "lấy hàng" : "giao hàng"}</p>
                <p className="text-xl font-bold text-orange-600">
                  {vehicleRoute.routeSteps.filter((s) => s.type === "job").length}
                </p>
              </div>
            </div>

            {/* Route Steps */}
            <div className="border border-orange-200 rounded-lg overflow-hidden">
              <div className="bg-orange-100 p-4">
                <h3 className="font-semibold text-[#4b1d09]">Các điểm {mode === "pickup" ? "lấy hàng" : "giao hàng"} ({vehicleRoute.routeSteps.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-orange-50 border-b border-orange-200">
                    <tr>
                      <th className="text-left p-3">Thứ tự</th>
                      <th className="text-left p-3">Loại</th>
                      <th className="text-left p-3">Mã đơn</th>
                      <th className="text-left p-3">Vị trí (Lat, Lng)</th>
                      <th className="text-left p-3">Khoảng cách</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicleRoute.routeSteps.map((step, index) => (
                      <tr key={step.id} className={`border-t border-orange-100 ${index % 2 === 0 ? "bg-white" : "bg-orange-50"}`}>
                        <td className="p-3 font-medium">{step.stepOrder}</td>
                        <td className="p-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              step.type === "start"
                                ? "bg-blue-100 text-blue-700"
                                : step.type === "end"
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {step.type === "start"
                              ? "Bắt đầu"
                              : step.type === "end"
                              ? "Kết thúc"
                              : mode === "pickup" ? "Lấy hàng" : "Giao hàng"}
                          </span>
                        </td>
                        <td className="p-3 font-semibold">
                          {step.jobId ? `#${step.jobId}` : "-"}
                        </td>
                        <td className="p-3 text-xs">
                          {step.lat.toFixed(4)}, {step.lng.toFixed(4)}
                        </td>
                        <td className="p-3">{formatDistance(step.distance)} km</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Route Information */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-[#4b1d09] mb-3 flex items-center gap-2">
                <Navigation fontSize="small" />
                Thông tin tuyến đường {mode === "pickup" ? "lấy hàng" : "giao hàng"}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Điểm bắt đầu:</p>
                  <p className="font-medium">
                    {vehicleRoute.routeSteps[0]?.lat.toFixed(4)}, {vehicleRoute.routeSteps[0]?.lng.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Điểm kết thúc:</p>
                  <p className="font-medium">
                    {vehicleRoute.routeSteps[vehicleRoute.routeSteps.length - 1]?.lat.toFixed(4)}, 
                    {vehicleRoute.routeSteps[vehicleRoute.routeSteps.length - 1]?.lng.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Số điểm {mode === "pickup" ? "lấy hàng" : "giao hàng"}:</p>
                  <p className="font-medium">
                    {vehicleRoute.routeSteps.filter((s) => s.type === "job").length}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có dữ liệu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteDetailModal;
