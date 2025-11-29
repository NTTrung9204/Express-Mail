import React, { useState, useEffect } from "react";
import {
  Close,
  DirectionsCar,
  DirectionsBike,
  DirectionsWalk,
  LocalShipping,
  Place,
  ShoppingBag,
  Store,
  Phone,
  Email,
  Navigation,
} from "@mui/icons-material";

const DeliveryScheduleModal = ({ open, shipper, onClose, routes, loading, fetchScheduleData }) => {
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [filters, setFilters] = useState({
    mode: "", 
    startDate: getTodayDate(),
    endDate: getTodayDate(),
  });

  useEffect(() => {
    if (open) {
      setFilters({
        mode: "",
        startDate: getTodayDate(),
        endDate: getTodayDate(),
      });
    }
  }, [open]);

  useEffect(() => {
    if (open && shipper && fetchScheduleData && filters.startDate && filters.endDate) {
      fetchScheduleData(
        shipper.id, 
        filters.mode, 
        filters.startDate, 
        filters.endDate
      );
    }
  }, [filters, open, shipper, fetchScheduleData]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const getModeIcon = (mode) => {
    switch (mode?.toLowerCase()) {
      case "car":
        return <DirectionsCar fontSize="small" />;
      case "bike":
        return <DirectionsBike fontSize="small" />;
      case "walk":
        return <DirectionsWalk fontSize="small" />;
      default:
        return <LocalShipping fontSize="small" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PICKUP_REQUESTED: { label: "Yêu cầu lấy hàng", color: "bg-blue-100 text-blue-700" },
      IN_TRANSIT: { label: "Đang giao", color: "bg-yellow-100 text-yellow-700" },
      DELIVERED: { label: "Đã giao", color: "bg-green-100 text-green-700" },
      PENDING: { label: "Chờ xử lý", color: "bg-gray-100 text-gray-700" },
      PROCESSING: { label: "Đang xử lý", color: "bg-orange-100 text-orange-700" },
    };
    const status_info = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-700" };
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${status_info.color}`}>
        {status_info.label}
      </span>
    );
  };

  const formatTime = (seconds) => {
    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const formatDistance = (distance) => {
    return (distance / 1000).toFixed(2);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const normalizedRoutes = React.useMemo(() => {
    if (!routes) return [];
    if (Array.isArray(routes)) return routes;
    if (routes.results && Array.isArray(routes.results)) return routes.results;
    if (typeof routes === 'object') return [routes];
    return [];
  }, [routes]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => e.target.id === "schedule-modal-overlay" && onClose()}
      id="schedule-modal-overlay"
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-xl w-[1000px] shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black cursor-pointer"
        >
          <Close />
        </button>

        <h2 className="text-2xl font-bold text-[#4b1d09] mb-2">
          Chi tiết lịch trình giao hàng
        </h2>
        {shipper && (
          <p className="text-gray-600 mb-6">
            Shipper: <span className="font-semibold">{shipper.firstName} {shipper.lastName}</span> - {shipper.profile?.phoneNumber || shipper.phone}
          </p>
        )}

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-6">
          <h3 className="font-semibold text-[#4b1d09] mb-3">Bộ lọc</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Loại công việc</label>
              <select
                value={filters.mode}
                onChange={(e) => handleFilterChange("mode", e.target.value)}
                className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
              >
                <option value="">Tất cả</option>
                <option value="pickup">Lấy hàng</option>
                <option value="delivery">Giao hàng</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Ngày kết thúc</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>
          </div>
        </div>
        
        {loading && (
          <div className="text-center py-10 text-[#7a4a32] font-medium">Đang tải lịch trình...</div>
        )}
        
        {!loading && normalizedRoutes.length === 0 && (
          <div className="text-center py-10 text-gray-500 border border-gray-200 bg-gray-50 rounded-lg">
            Không tìm thấy lịch trình nào phù hợp với bộ lọc.
          </div>
        )}

        {!loading && normalizedRoutes.map((route, routeIndex) => (
          <div key={routeIndex} className="mb-6 border-b border-orange-200 pb-4">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <p className="text-xs text-gray-600 mb-1">Tổng khoảng cách</p>
                <p className="text-lg font-bold text-orange-600">
                  {formatDistance(route.distance)} km
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <p className="text-xs text-gray-600 mb-1">Thời gian dự kiến</p>
                <p className="text-lg font-bold text-orange-600">
                  {formatTime(route.duration)}
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <p className="text-xs text-gray-600 mb-1">Phương tiện</p>
                <p className="text-lg font-bold text-orange-600 flex items-center gap-1">
                  {getModeIcon(route.mode)}
                  {route.mode === "car" ? "Xe ô tô" : route.mode === "bike" ? "Xe máy" : route.mode === "walk" ? "Đi bộ" : "N/A"}
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <p className="text-xs text-gray-600 mb-1">Thời gian tạo lịch</p>
                <p className="text-sm font-bold text-orange-600">
                  {formatDateTime(route.time)}
                </p>
              </div>
            </div>

            <div className="border border-orange-200 rounded-lg overflow-hidden">
              <div className="bg-orange-100 p-4">
                <h3 className="font-semibold text-[#4b1d09]">
                  Các điểm giao hàng ({route.orders?.length || 0})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-orange-50 border-b border-orange-200">
                    <tr>
                      <th className="text-left p-3">STT</th>
                      <th className="text-left p-3">Mã đơn</th>
                      <th className="text-left p-3">Người nhận</th>
                      <th className="text-left p-3">Địa chỉ</th>
                      <th className="text-left p-3">Sản phẩm</th>
                      <th className="text-left p-3">COD</th>
                      <th className="text-left p-3">Phí ship</th>
                      <th className="text-left p-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {route.orders && route.orders.length > 0 ? (
                      route.orders.map((order, index) => (
                        <React.Fragment key={order.id}>
                          <tr
                            className={`border-t border-orange-100 ${
                              index % 2 === 0 ? "bg-white" : "bg-orange-50"
                            }`}
                          >
                            <td className="p-3 font-medium">
                              <div className="bg-orange-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">
                                {order.routeStep?.stepOrder || index + 1}
                              </div>
                            </td>
                            <td className="p-3 font-semibold text-[#4b1d09]">{order.code}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-1 text-xs">
                                <Phone fontSize="inherit" className="text-gray-500" />
                                {order.receiver_phone}
                              </div>
                            </td>
                            <td className="p-3 text-xs">
                              <div className="flex items-start gap-1">
                                <Place fontSize="inherit" className="text-orange-500 mt-0.5" />
                                <div>
                                  <p className="font-medium">{order.receiver_address}</p>
                                  <p className="text-gray-600">
                                    {order.receiver_ward_commune}, {order.receiver_province_city}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1 text-xs">
                                <ShoppingBag fontSize="inherit" className="text-gray-500" />
                                {order.products?.length || 0} sản phẩm
                              </div>
                            </td>
                            <td className="p-3 font-semibold text-orange-600">
                              {formatCurrency(order.cod)}
                            </td>
                            <td className="p-3">
                              <div className="text-xs">
                                <p className="font-medium">{formatCurrency(order.shipping_cost)}</p>
                                <p className="text-gray-500">
                                  {order.is_receiver_pay_shipping ? "Người nhận trả" : "Shop trả"}
                                </p>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="space-y-1">
                                {getStatusBadge(order.shipping_status)}
                              </div>
                            </td>
                          </tr>
                          <tr className={index % 2 === 0 ? "bg-gray-50" : "bg-orange-25"}>
                            <td colSpan="8" className="p-0">
                              <div className="p-4 border-t border-orange-100">
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-3">
                                    {order.shopProfile && (
                                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        <h4 className="font-semibold text-xs text-gray-700 mb-2 flex items-center gap-1">
                                          <Store fontSize="small" />
                                          Thông tin Shop
                                        </h4>
                                        <div className="text-xs space-y-1">
                                          <p>
                                            <span className="text-gray-600">Tên:</span>{" "}
                                            <span className="font-medium">
                                              {order.shopProfile.firstName} {order.shopProfile.lastName}
                                            </span>
                                          </p>
                                          <p className="flex items-center gap-1">
                                            <Phone fontSize="inherit" className="text-gray-500" />
                                            {order.shopProfile.phoneNumber}
                                          </p>
                                          {order.shopProfile.email && (
                                            <p className="flex items-center gap-1">
                                              <Email fontSize="inherit" className="text-gray-500" />
                                              {order.shopProfile.email}
                                            </p>
                                          )}
                                          <p className="flex items-start gap-1">
                                            <Place fontSize="inherit" className="text-gray-500 mt-0.5" />
                                            {order.shopProfile.address}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                      <h4 className="font-semibold text-xs text-gray-700 mb-2">
                                        Thông tin kiện hàng
                                      </h4>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                          <span className="text-gray-600">Dài:</span>{" "}
                                          <span className="font-medium">{order.length} cm</span>
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Rộng:</span>{" "}
                                          <span className="font-medium">{order.width} cm</span>
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Cao:</span>{" "}
                                          <span className="font-medium">{order.height} cm</span>
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Cân nặng:</span>{" "}
                                          <span className="font-medium">{order.weight} kg</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    {order.routeStep && (
                                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                        <h4 className="font-semibold text-xs text-gray-700 mb-2 flex items-center gap-1">
                                          <Navigation fontSize="small" />
                                          Thông tin tuyến đường
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          <div>
                                            <span className="text-gray-600">Vị trí:</span>{" "}
                                            <span className="font-medium">
                                              {order.routeStep.lat?.toFixed(4)}, {order.routeStep.lng?.toFixed(4)}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-600">Thời gian đến:</span>{" "}
                                            <span className="font-medium">
                                              {formatTime(order.routeStep.arrival)}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-600">Khoảng cách:</span>{" "}
                                            <span className="font-medium">
                                              {formatDistance(order.routeStep.distance)} km
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-600">Thời gian giao:</span>{" "}
                                            <span className="font-medium">
                                              {order.routeStep.duration} phút
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-600">Tải hàng:</span>{" "}
                                            <span className="font-medium">{order.routeStep.load}</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-600">Trạng thái bước:</span>{" "}
                                            <span className="font-medium">
                                              {order.routeStep.status || 'N/A'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {order.products && order.products.length > 0 && (
                                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                        <h4 className="font-semibold text-xs text-gray-700 mb-2">
                                          Danh sách sản phẩm
                                        </h4>
                                        <div className="space-y-2">
                                          {order.products.map((product) => (
                                            <div
                                              key={product.id}
                                              className="bg-white p-2 rounded text-xs"
                                            >
                                              <p className="font-medium text-gray-800">
                                                {product.name}
                                              </p>
                                              <div className="flex gap-4 text-gray-600 mt-1">
                                                <span>SL: {product.quantity}</span>
                                                <span>Cân nặng: {product.weight} kg</span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                      <h4 className="font-semibold text-xs text-gray-700 mb-2">
                                        Thông tin bổ sung
                                      </h4>
                                      <div className="text-xs space-y-1">
                                        <p>
                                          <span className="text-gray-600">Sẵn sàng giao:</span>{" "}
                                          <span className="font-medium">
                                            {order.isReadyForDelivery ? "Có" : "Không"}
                                          </span>
                                        </p>
                                        <p>
                                          <span className="text-gray-600">KC đến người nhận:</span>{" "}
                                          <span className="font-medium">
                                            {order.distanceToReceiver} km
                                          </span>
                                        </p>
                                        <p>
                                          <span className="text-gray-600">KC bưu cục gần nhất:</span>{" "}
                                          <span className="font-medium">
                                            {order.nearestPostOfficeDistance} km
                                          </span>
                                        </p>
                                        <p>
                                          <span className="text-gray-600">Tạo lúc:</span>{" "}
                                          <span className="font-medium">
                                            {formatDateTime(order.created_at)}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-4 text-gray-500">
                          Không có đơn hàng nào trong tuyến đường này.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryScheduleModal;