import React, { useState } from 'react'
import TopNav from '../components/TopNav';
import Tabs from '../components/Tabs';
import FilterBar from '../components/FilterBar';
import Orders from '../components/Orders';

const OrderDeliverPage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const tabCounts = [0, 0, 0, 0, 0, 0, 0, 0];
  return (
    <>
        <div className="flex-1 flex flex-col">
            <TopNav />
            <Tabs active={activeTab} counts={tabCounts} onTabChange={setActiveTab} />
            <FilterBar />
            <div className="flex-1 flex items-center justify-center bg-gray-50">
            <Orders />
        </div>
        </div>
    </>
  )
}

export default OrderDeliverPage