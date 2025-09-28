import React from 'react'
import Sidebar from '../components/Sidebar'

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="Quản lý đơn hàng" />
      <div className="flex-1 p-4">
        {children}
      </div>
    </div>
  )
}

export default MainLayout