import React from 'react'
import Sidebar from '../components/Sidebar'

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="sticky top-0 h-screen">
        <Sidebar active="Quản lý đơn hàng" />
      </div>

      <div className="flex-1 p-4 overflow-auto max-h-screen">
        {children}
      </div>
    </div>
  )
}

export default MainLayout
