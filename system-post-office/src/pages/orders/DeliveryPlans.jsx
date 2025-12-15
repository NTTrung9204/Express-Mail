import React, { useState, useEffect } from "react";
import { Visibility, Timeline, LocalShipping, EventNote, ExpandMore, ExpandLess, PersonAdd } from "@mui/icons-material";
import RouteDetailModal from "../../components/orders/delivery_plans/RouteDetailModal";
import AssignShipperModal from "../../components/orders/delivery_plans/AssignShipperModal";
import Pagination from "../../components/common/Pagination";
import plansAPI from "../../api/plansAPI";
import authAPI from "../../api/authAPI";
import { toast } from "react-toastify";

const DeliveryPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [mode, setMode] = useState("pickup");
  const [openRouteDetail, setOpenRouteDetail] = useState(false);
  const [selectedVehicleRouteId, setSelectedVehicleRouteId] = useState(null);
  const [expandedPlans, setExpandedPlans] = useState(new Set());
  const [openAssignShipper, setOpenAssignShipper] = useState(false);
  const [selectedVehicleRouteForAssign, setSelectedVehicleRouteForAssign] = useState(null);

  // Get post office ID from user data
  const user = authAPI.getUser();
  const postOfficeId = user?.postOffice || 1;

  // Fetch plans
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await plansAPI.getRoutePlans(postOfficeId, mode, page, limit);

      if (response.success) {
        setPlans(response.data.data || []);
        setTotal(response.data.meta?.total || 0);
      } else {
        toast.error("Lỗi khi lấy danh sách kế hoạch");
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Lỗi khi lấy danh sách kế hoạch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [mode]);

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, mode]);

  // Format time in seconds to HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Format distance in meters to km
  const formatDistance = (distance) => {
    return (distance / 1000).toFixed(2);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const vietnamDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const day = String(vietnamDate.getUTCDate()).padStart(2, "0");
    const month = String(vietnamDate.getUTCMonth() + 1).padStart(2, "0");
    const year = vietnamDate.getUTCFullYear();
    const hours = String(vietnamDate.getUTCHours()).padStart(2, "0");
    const minutes = String(vietnamDate.getUTCMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Open route detail modal
  const handleViewRoute = (vehicleRouteId) => {
    setSelectedVehicleRouteId(vehicleRouteId);
    setOpenRouteDetail(true);
  };

  return (
    <div className="bg-[#fff6f1] min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#4b1d09] flex items-center gap-2 mb-2">
            <LocalShipping fontSize="large" />
            Quản lý kế hoạch giao hàng
          </h1>
          <p className="text-gray-600">Quản lý và theo dõi các tuyến đường giao hàng</p>
        </div>

        {/* Mode Tabs */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="flex border-b border-orange-200">
            <button
              onClick={() => setMode("pickup")}
              className={`flex-1 py-4 font-semibold flex items-center justify-center gap-2 transition ${
                mode === "pickup"
                  ? "bg-orange-500 text-white border-b-4 border-orange-600"
                  : "bg-white text-[#4b1d09] hover:bg-orange-50"
              }`}
            >
              <Timeline fontSize="small" />
              Lấy hàng (Pickup)
            </button>
            <button
              onClick={() => setMode("delivery")}
              className={`flex-1 py-4 font-semibold flex items-center justify-center gap-2 transition ${
                mode === "delivery"
                  ? "bg-orange-500 text-white border-b-4 border-orange-600"
                  : "bg-white text-[#4b1d09] hover:bg-orange-50"
              }`}
            >
              <LocalShipping fontSize="small" />
              Giao hàng (Delivery)
            </button>
          </div>
        </div>

        {/* Plans List */}
        <div className="bg-white rounded-xl shadow p-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <EventNote className="text-gray-300 mb-2" style={{ fontSize: "48px" }} />
              <p className="text-gray-500 text-lg">Không có kế hoạch nào</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="border border-orange-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-[#4b1d09]">Kế hoạch #{plan.id}</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">
                            {plan.vehicleRoutes.length} tuyến đường
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Tạo lúc: {formatDate(plan.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Plan Statistics */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div className="bg-orange-50 p-3 rounded border border-orange-200">
                        <p className="text-xs text-gray-600">Tổng khoảng cách</p>
                        <p className="font-semibold text-orange-600">{formatDistance(plan.totalDistance)} km</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded border border-orange-200">
                        <p className="text-xs text-gray-600">Thời gian</p>
                        <p className="font-semibold text-orange-600">{formatTime(plan.totalDuration)}</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded border border-orange-200">
                        <p className="text-xs text-gray-600">Chi phí</p>
                        <p className="font-semibold text-orange-600">{plan.totalCost.toLocaleString("vi-VN")} đ</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded border border-orange-200">
                        <p className="text-xs text-gray-600">Chưa gán</p>
                        <p className="font-semibold text-orange-600">{plan.unassignedCount}</p>
                      </div>
                    </div>

                    {/* Vehicle Routes */}
                    <div className="border-t border-orange-200 pt-4">
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedPlans);
                          if (newExpanded.has(plan.id)) {
                            newExpanded.delete(plan.id);
                          } else {
                            newExpanded.add(plan.id);
                          }
                          setExpandedPlans(newExpanded);
                        }}
                        className="w-full flex items-center justify-between p-3 hover:bg-orange-50 rounded-lg transition cursor-pointer font-semibold text-[#4b1d09]"
                      >
                        <span className="flex items-center gap-2">
                          Các đợt giao hàng ({plan.vehicleRoutes.length})
                        </span>
                        {expandedPlans.has(plan.id) ? (
                          <ExpandLess fontSize="small" />
                        ) : (
                          <ExpandMore fontSize="small" />
                        )}
                      </button>

                      {expandedPlans.has(plan.id) && (
                        <div className="mt-3 space-y-2 pl-3">
                          {plan.vehicleRoutes.map((route) => (
                            <div
                              key={route.id}
                              className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200 hover:shadow-sm transition"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-[#4b1d09]">
                                    Đợt giao hàng {route.vehicleId ? `xe ${route.vehicleId}` : "chưa gán"}
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                    {route.routeSteps.filter((s) => s.type === "job").length} điểm
                                  </span>
                                </div>
                                <div className="flex gap-4 text-xs text-gray-600">
                                  <span>KM: {formatDistance(route.distance)}</span>
                                  <span>Thời gian: {formatTime(route.duration)}</span>
                                  <span>Chi phí: {route.cost.toLocaleString("vi-VN")} đ</span>
                                </div>
                              </div>
                              <div className="ml-4 flex gap-2">
                                {!route.vehicleId && (
                                  <button
                                    onClick={() => {
                                      setSelectedVehicleRouteForAssign(route.id);
                                      setOpenAssignShipper(true);
                                    }}
                                    className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium inline-flex items-center gap-2 transition cursor-pointer"
                                  >
                                    <PersonAdd fontSize="small" /> Gán
                                  </button>
                                )}
                                <button
                                  onClick={() => handleViewRoute(route.id)}
                                  className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium inline-flex items-center gap-2 transition cursor-pointer"
                                >
                                  <Visibility fontSize="small" /> Chi tiết
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
      </div>

      {/* Route Detail Modal */}
      <RouteDetailModal
        open={openRouteDetail}
        onClose={() => setOpenRouteDetail(false)}
        vehicleRouteId={selectedVehicleRouteId}
      />

      {/* Assign Shipper Modal */}
      <AssignShipperModal
        open={openAssignShipper}
        onClose={() => setOpenAssignShipper(false)}
        vehicleRouteId={selectedVehicleRouteForAssign}
        postOfficeId={postOfficeId}
        onAssignSuccess={() => fetchPlans()}
      />
    </div>
  );
};

export default DeliveryPlans;
