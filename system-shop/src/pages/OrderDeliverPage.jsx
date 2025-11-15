import React, { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import Tabs from "../components/Tabs";
import Orders from "../components/Orders";
import { useOrderStore } from "../stores/useOrderStore"

const OrderDeliverPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const tabCounts = [0, 0, 0, 0, 0, 0, 0, 0];

  const { orders, loading, error, getOrdersByShopId } = useOrderStore();


  useEffect(() => {
    getOrdersByShopId();
  }, [getOrdersByShopId]);

  return (
    <div className="flex-1 flex flex-col">
      <TopNav />
      <Tabs active={activeTab} counts={tabCounts} onTabChange={setActiveTab} />
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <Orders data={orders} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default OrderDeliverPage;
