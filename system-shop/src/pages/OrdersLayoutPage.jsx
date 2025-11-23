import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import Tabs from "../components/Tabs";
import Orders from "../components/Orders";
import EmptyState from "../components/EmptyState";
import { useOrderStore } from "../stores/useOrderStore";
import { ORDER_TABS } from "../constants/orderTabs";

const OrdersLayoutPage = () => {
  const { tabId } = useParams();            
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);

  const { 
    orders, 
    loading, 
    error, 
    pagination,
    nextPage, 
    prevPage,  
    getOrdersByShopId 
  } = useOrderStore();

  useEffect(() => {
    const index = ORDER_TABS.findIndex((t) => t.id === tabId);

    if (index === -1) {
      navigate(`/orders/${ORDER_TABS[0].id}`, { replace: true });
      return;
    }

    setActiveTab(index);
  }, [tabId, navigate]);

  const handleTabChange = (index) => {
    navigate(`/orders/${ORDER_TABS[index].id}`);
  };

  const tabCounts = useMemo(() => {
    return ORDER_TABS.map((tab) =>
      orders.filter((order) => tab.statuses.includes(order.rawStatus)).length
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const currentTab = ORDER_TABS[activeTab];
    return orders.filter((order) =>
      currentTab.statuses.includes(order.rawStatus)
    );
  }, [orders, activeTab]);

  useEffect(() => {
    getOrdersByShopId(); 
  }, [getOrdersByShopId]);

  return (
    <div className="flex-1 flex flex-col">
      <TopNav />

      <Tabs
        activeTab={activeTab}
        counts={tabCounts}
        onTabChange={handleTabChange}
      />

      <div className="flex-1 flex items-center justify-center bg-gray-50">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState />
        ) : (
          <Orders 
            data={filteredOrders} 
            pagination={pagination}
            nextPage={nextPage}
            prevPage={prevPage}
          />
        )}
      </div>
    </div>
  );
};

export default OrdersLayoutPage;