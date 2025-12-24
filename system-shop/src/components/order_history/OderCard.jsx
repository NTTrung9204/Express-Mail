import React from 'react';
import AccessTime from '@mui/icons-material/AccessTime';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import PersonOutline from '@mui/icons-material/PersonOutline';

const OrderCard = ({ order, onClick }) => {
  const getStatusColor = (status) => {
    const colors = {
      'PICKUP_REQUESTED': 'bg-blue-100 text-blue-800',
      'IN_TRANSIT': 'bg-purple-100 text-purple-800',
      'CLASSIFIED': 'bg-indigo-100 text-indigo-800',
      'IN_WAREHOUSE': 'bg-orange-100 text-orange-800',
      'SHIPPING': 'bg-cyan-100 text-cyan-800',
      'PICKUP_FAILED': 'bg-red-100 text-red-800',
      'DELIVERY_FAILED': 'bg-red-100 text-red-800',
      'FINISHED': 'bg-green-100 text-green-800',
      'RETURNING': 'bg-pink-100 text-pink-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div 
      onClick={() => onClick(order)}
      className="bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer overflow-hidden"
    >
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Inventory2Outlined className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Mã: {order.code}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <AccessTime className="w-3 h-3" />
              {new Date(order.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.shippingStatusRaw)}`}>
          {order.shippingStatus}
        </span>
      </div>

      <div className="p-4 space-y-3">

        <div className="pt-3 space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <LocationOnOutlined className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-gray-600 text-xs mb-0.5">Giao đến</p>
              <p className="text-gray-900 line-clamp-2">{order.address}</p>
            </div>
          </div>

                    
          <div className="flex items-center gap-2 text-sm">
            <PersonOutline className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">{order.receiver}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <PhoneOutlined className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">{order.phone}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Inventory2Outlined className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {order.products.length} sản phẩm • {order.weight}g
              </span>
            </div>
            <div className="flex items-center gap-1 text-orange-600 font-semibold">
              <span>{order.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;