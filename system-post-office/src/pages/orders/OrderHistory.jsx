import React, { useState, useEffect } from "react";
import {
  Inventory2,
  LocalShipping,
  CheckCircle,
  Schedule,
  Error,
  TrendingFlat,
  Warehouse,
  ShoppingCart,
} from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import { ordersAPI } from "../../api/ordersAPI";
import { postOfficeAPI } from "../../api/postOfficeAPI";
import shippersAPI from "../../api/shippersAPI";
import { toast } from "react-toastify";
import ProtectedImage from "../../components/common/ProtectedImage";

const OrderHistory = () => {
  const baseURL = 'https://pbl6-express-mail-nestjs.work.gd';
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState([]);
  const [postOfficeCache, setPostOfficeCache] = useState({});
  const [shipperCache, setShipperCache] = useState({});

  const translateStatus = (s) => {
    if (!s) return "Chưa có thông tin";
    const map = {
      PICKUP_REQUESTED: "Shipper đang đến lấy hàng",
      PICKUP_FAILED: "Lấy hàng thất bại",
      DELIVERY_FAILED: "Giao hàng thất bại",
      RETURNING: "Đang trả hàng",
      SHIPPING: "Đang giao hàng",
      FINISHED: "Giao hàng thành công",
      CREATED: "Đơn đã được tạo",
      PENDING: "Chuẩn bị chuyển hàng",
      TRANSITING: "Đang chuyển giữa bưu cục",
      DONE: "Đã chuyển thành công",
    };
    return map[s] || s;
  };

  useEffect(() => {
    if (!code) {
      toast.error("Không tìm thấy mã đơn hàng");
      // keep user on the page (no back navigation)
      return;
    }

    fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getOrderByCode(code);

      if (response.success) {
        const orderData = response.data;
        setOrder(orderData);
        await buildTimeline(orderData);
      } else {
        toast.error("Lỗi khi lấy thông tin đơn hàng");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Lỗi khi lấy thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const buildTimeline = async (orderData) => {
    const events = [];

    // Collect all post office IDs that need to be fetched
    const postOfficeIds = new Set();
    
    if (orderData.orderPostOffices && orderData.orderPostOffices.length > 0) {
      orderData.orderPostOffices.forEach(po => {
        if (po.postOfficeId) postOfficeIds.add(po.postOfficeId);
      });
    }

    if (orderData.transitions && orderData.transitions.length > 0) {
      orderData.transitions.forEach(transition => {
        if (transition.currentPostOfficeId) postOfficeIds.add(transition.currentPostOfficeId);
        if (transition.nextPostOfficeId) postOfficeIds.add(transition.nextPostOfficeId);
      });
    }

    // Fetch all post office details - use local variable, not state
    let poCache = {};
    if (postOfficeIds.size > 0) {
      poCache = await postOfficeAPI.getMultiplePostOffices(Array.from(postOfficeIds));
    }
    setPostOfficeCache(poCache);

    // Fetch all shipper details by post office
    let sCache = {};
    if (postOfficeIds.size > 0) {
      // Fetch shippers for each post office
      for (const postOfficeId of postOfficeIds) {
        try {
          const response = await shippersAPI.getShippers(postOfficeId, 1, 100);
          if (response.success && response.data.length > 0) {
            response.data.forEach(shipper => {
              sCache[shipper.id] = `${shipper.firstName || ""} ${shipper.lastName || ""}`.trim();
            });
          }
        } catch (error) {
          console.error(`Error fetching shippers for post office ${postOfficeId}:`, error);
        }
      }
    }
    setShipperCache(sCache);

    // Add order creation event
    events.push({
      id: `create-${orderData.id}`,
      type: "creation",
      timestamp: new Date(orderData.created_at),
      status: "CREATED",
      title: "Đơn hàng được tạo",
      description: `Mã đơn: ${orderData.code}`,
      icon: <ShoppingCart className="text-orange-600" />,
      color: "orange",
    });

    // Add post office events
    if (orderData.orderPostOffices && orderData.orderPostOffices.length > 0) {
      orderData.orderPostOffices.forEach((po, index) => {
        const statusMessages = {
          PICKUP_REQUESTED: "Đang được lấy tại bưu cục",
          CLASSIFIED: "Đang được phân loại",
          IN_WAREHOUSE: "Đang được lưu trữ trong kho",
        };

        const poDetails = poCache[po.postOfficeId];
        const poName = poDetails?.name || `Bưu cục #${po.postOfficeId}`;

        events.push({
          id: `po-${po.id}-${index}`,
          type: "postoffice",
          timestamp: new Date(po.created_at),
          status: po.status,
          title: statusMessages[po.status] || po.status,
          description: poName,
          icon:
            po.status === "PICKUP_REQUESTED" ? (
              <Inventory2 className="text-orange-600" />
            ) : po.status === "CLASSIFIED" ? (
              <TrendingFlat className="text-orange-600" />
            ) : (
              <Warehouse className="text-orange-600" />
            ),
          color: "orange",
        });
      });
    }

    // Add transition events
    if (orderData.transitions && orderData.transitions.length > 0) {
      orderData.transitions.forEach((transition) => {
        console.log("Processing transition:", transition);
        const statusMessages = {
          PENDING: "Chuẩn bị chuyển hàng",
          TRANSITING: "Đang chuyển hàng",
          DONE: "Đã chuyển hàng thành công",
        };

        const isSuccess = transition.status === "DONE";
        const icon =
          transition.status === "DONE" ? (
            <CheckCircle className="text-green-600" />
          ) : transition.status === "TRANSITING" ? (
            <LocalShipping className="text-blue-600" />
          ) : (
            <Schedule className="text-yellow-600" />
          );

        const nextPODetails = poCache[transition.nextPostOfficeId];

        console.log('poCache', poCache);
        console.log('postOfficeCache', postOfficeCache);
        console.log('transition', transition);

        
        const currentPOName = poCache[transition.currentPostOfficeId]?.name || `người gửi`;
        const nextPOName = nextPODetails?.name || `Bưu cục #${transition.nextPostOfficeId}`;

        events.push({
          id: `tr-${transition.id}`,
          type: "transition",
          timestamp: new Date(transition.createdAt),
          status: transition.status,
          title: statusMessages[transition.status] || transition.status,
          description: `Từ ${currentPOName} → ${nextPOName}`,
          icon,
          color: isSuccess ? "green" : transition.status === "TRANSITING" ? "blue" : "yellow",
        });
      });
    }

    // Add shipping events
    if (orderData.shipping && orderData.shipping.length > 0) {
      orderData.shipping.forEach((ship, index) => {
        const previousShip = index > 0 ? orderData.shipping[index - 1] : null;

        const statusMessages = {
          PICKUP_REQUESTED: "Shipper đang đến lấy hàng",
          PICKUP_FAILED: "Lấy hàng thất bại",
          DELIVERY_FAILED: "Giao hàng thất bại",
          RETURNING: "Đang trả hàng",
          SHIPPING: "Đang giao hàng",
          FINISHED:
            previousShip?.status === "PICKUP_REQUESTED"
              ? "Lấy hàng thành công"
              : previousShip?.status === "RETURNING"
              ? "Trả hàng thành công"
              : "Giao hàng thành công",
        };

        const isSuccess = ship.status === "FINISHED";
        const isFailed =
          ship.status === "PICKUP_FAILED" || ship.status === "DELIVERY_FAILED";
        const isInProgress =
          ship.status === "SHIPPING" ||
          ship.status === "RETURNING" ||
          ship.status === "PICKUP_REQUESTED";

        let icon;
        let color;

        if (isSuccess) {
          icon = <CheckCircle className="text-green-600" />;
          color = "green";
        } else if (isFailed) {
          icon = <Error className="text-red-600" />;
          color = "red";
        } else if (isInProgress) {
          icon = <LocalShipping className="text-orange-600" />;
          color = "orange";
        } else {
          icon = <Schedule className="text-yellow-600" />;
          color = "yellow";
        }

        events.push({
          id: `ship-${ship.id}`,
          type: "shipping",
          timestamp: new Date(ship.createdAt),
          status: ship.status,
          title: statusMessages[ship.status] || ship.status,
          description: `${sCache[ship.shipperId] || `Shipper #${ship.shipperId}` || "N/A"}`,
          icon,
          color,
        });
      });
    }

    // Sort by timestamp ascending
    events.sort((a, b) => a.timestamp - b.timestamp);
    setTimeline(events);
  };


  const getColorClasses = (color) => {
    const colors = {
      orange: "border-l-4 border-orange-400 bg-orange-50",
      green: "border-l-4 border-green-400 bg-green-50",
      red: "border-l-4 border-red-400 bg-red-50",
      blue: "border-l-4 border-blue-400 bg-blue-50",
      yellow: "border-l-4 border-yellow-400 bg-yellow-50",
    };
    return colors[color] || colors.orange;
  };

  const getIconBgColor = (color) => {
    const colors = {
      orange: "bg-orange-100",
      green: "bg-green-100",
      red: "bg-red-100",
      blue: "bg-blue-100",
      yellow: "bg-yellow-100",
    };
    return colors[color] || colors.orange;
  };

  if (loading) {
    return (
      <div className="bg-[#fff6f1] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#fff6f1] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Không tìm thấy thông tin đơn hàng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fff6f1] min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        {/* Order Header */}
        <div className="bg-white rounded-xl shadow p-6 mb-6 border border-orange-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#4b1d09]">{order.code}</h1>
              <p className="text-gray-600 text-sm mt-1">
                Người gửi: {order.shopProfile?.username || "N/A"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">COD</p>
              <p className="text-2xl font-bold text-orange-600">
                {(order.cod || 0).toLocaleString("vi-VN")} đ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Địa chỉ nhận:</p>
              <p className="font-medium text-[#4b1d09]">
                {order.receiver_address}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Số điện thoại:</p>
              <p className="font-medium text-[#4b1d09]">{order.receiver_phone}</p>
            </div>
          </div>

          {/* Products Summary */}
          <div className="mt-4 pt-4 border-t border-orange-100">
            <p className="text-sm text-gray-600 mb-3 font-medium">
              Sản phẩm ({order.products?.length || 0})
            </p>

            <div className="grid grid-cols-1 gap-3">
              {order.products?.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm border border-orange-50">
                  {product.img_url && (
                    <ProtectedImage
                        src={baseURL+product.img_url} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#4b1d09]">{product.name}</div>
                    <div className="text-xs text-gray-500 mt-1">Số lượng: {product.quantity}</div>
                  </div>
                  <div className="text-sm text-gray-600">{product.weight ? `${product.weight} kg` : ""}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow p-6 border border-orange-200">
          <h2 className="text-xl font-bold text-[#4b1d09] mb-6">
            Lịch sử vận chuyển
          </h2>

          <div className="space-y-4">
            {timeline.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Chưa có sự kiện nào được ghi nhận
              </p>
            ) : (
              timeline.map((event, index) => (
                <div key={event.id} className="relative">
                  {/* Timeline line */}
                  {index < timeline.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-12 bg-gradient-to-b from-orange-300 to-orange-100" />
                  )}

                  {/* Event */}
                  <div className={`p-4 rounded-lg ${getColorClasses(event.color)}`}>
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full ${getIconBgColor(event.color)} flex items-center justify-center mt-1`}
                      >
                        {event.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-grow">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-[#4b1d09]">
                              {event.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {event.description}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {event.timestamp.toLocaleString("vi-VN")}
                          </span>
                        </div>

                        {/* Remove raw enum tag; show friendly status text when relevant */}
                        {event.status && (
                          <div className="mt-2 text-sm text-gray-600">
                            {translateStatus(event.status)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;