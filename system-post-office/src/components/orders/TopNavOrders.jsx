import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ordersAPI } from "../../api/ordersAPI";
import authAPI from "../../api/authAPI";
import { fetchUserPostOfficeId } from "../../api/profileAPI";
import { toast } from "react-toastify";

const tabs = [
  { name: "Đơn đã nhận", path: "received", type: "received" },
  { name: "Đơn giao thất bại", path: "failed", type: "failed" },
  { name: "Đơn yêu cầu", path: "request", type: "request" },
  { name: "Đơn đã phân loại", path: "classified", type: "classified" },
  { name: "Đơn sắp đến", path: "incoming", type: "incoming" },
  { name: "Đơn trung chuyển", path: "transiting", type: "transiting" },
];

const TopNavOrders = () => {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [postOfficeId, setPostOfficeId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const initPostOfficeId = async () => {
      const user = authAPI.getUser();
      const userId = user?.id;

      if (!userId) {
        return;
      }

      const id = await fetchUserPostOfficeId(userId);
      if (id) {
        setPostOfficeId(id);
      }
    };

    initPostOfficeId();
  }, []);

  useEffect(() => {
    if (!postOfficeId) return;

    const fetchCounts = async () => {
      setLoading(true);
      try {
        const newCounts = {};

        // Fetch received orders
        try {
          const receivedRes = await ordersAPI.getReceivedOrders(postOfficeId, 1, 10);
          newCounts.received = receivedRes.data?.meta?.total || receivedRes.data?.total || 0;
        } catch (error) {
          console.error("Error fetching received orders:", error);
          newCounts.received = 0;
        }

        // Fetch failed orders (both pickup and delivery failed)
        try {
          // Fetch pickup failed orders
          const pickupRes = await ordersAPI.getPickupOrders(postOfficeId, 1, 10);
          const pickupOrders = pickupRes.data?.data || [];
          const pickupFailed = pickupOrders.filter(
            (order) =>
              order.shipping &&
              Array.isArray(order.shipping) &&
              order.shipping.some((ship) => ship.status === "PICKUP_FAILED")
          ).length;

          // Fetch delivery failed orders
          const deliveryRes = await ordersAPI.getReceivedOrders(postOfficeId, 1, 10);
          const deliveryOrders = deliveryRes.data?.data || [];
          const deliveryFailed = deliveryOrders.filter(
            (order) =>
              order.shipping &&
              Array.isArray(order.shipping) &&
              order.shipping.some((ship) => ship.status === "DELIVERY_FAILED")
          ).length;

          newCounts.failed = pickupFailed + deliveryFailed;
        } catch (error) {
          console.error("Error fetching failed orders:", error);
          newCounts.failed = 0;
        }

        // Fetch request orders
        try {
          const requestRes = await ordersAPI.getPickupOrders(postOfficeId, 1, 10);
          newCounts.request = requestRes.data?.meta?.total || requestRes.data?.total || 0;
        } catch (error) {
          console.error("Error fetching request orders:", error);
          newCounts.request = 0;
        }

        // Fetch classified orders
        try {
          const classifiedRes = await ordersAPI.getClassifiedOrders(postOfficeId, 1, 10);
          newCounts.classified = classifiedRes.data?.meta?.total || classifiedRes.data?.total || 0;
        } catch (error) {
          console.error("Error fetching classified orders:", error);
          newCounts.classified = 0;
        }

        // Fetch incoming orders
        try {
          const incomingRes = await ordersAPI.getInComingOrders(postOfficeId, 1, 10);
          newCounts.incoming = incomingRes.data?.meta?.total || incomingRes.data?.total || 0;
        } catch (error) {
          console.error("Error fetching incoming orders:", error);
          newCounts.incoming = 0;
        }

        // Fetch transiting orders
        try {
          const transitingRes = await ordersAPI.getTransitingOrders(postOfficeId, 1, 10);
          newCounts.transiting = transitingRes.data?.meta?.total || transitingRes.data?.total || 0;
        } catch (error) {
          console.error("Error fetching transiting orders:", error);
          newCounts.transiting = 0;
        }

        setCounts(newCounts);
      } catch (error) {
        console.error("Error fetching order counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [postOfficeId, location.pathname]);

  return (
    <div className="flex gap-6 border-b border-gray-200 flex-wrap">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `pb-2 font-medium text-sm ${
              isActive
                ? "text-orange-600 border-b-2 border-orange-500"
                : "text-gray-500 hover:text-orange-600"
            }`
          }
        >
          {tab.name} ({counts[tab.type] ?? 0})
        </NavLink>
      ))}
    </div>
  );
};

export default TopNavOrders;
