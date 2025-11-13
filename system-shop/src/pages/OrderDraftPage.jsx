import React, { useState } from 'react'
import TopNav from '../components/TopNav';
import Tabs from '../components/Tabs';
import EmptyState from '../components/EmptyState';

const OrderDraftPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const tabCounts = [0, 0, 0, 0, 0, 0, 0, 0];

  return (
     <div className="flex-1 flex flex-col">
        <TopNav />
        <Tabs active={activeTab} counts={tabCounts} onTabChange={setActiveTab} />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <EmptyState />
        </div>
     </div>
  )
}

export default OrderDraftPage
