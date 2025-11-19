import React from 'react';

const ShippingJourney = ({ transitions, shipping, orderPostOffices }) => {
  const allEvents = [
    ...(transitions || []).map(t => ({
      type: 'transition',
      status: t.status,
      postOffice: t.nextPostOfficeId,
      time: t.createdAt,
      data: t
    })),
    ...(shipping || []).map(s => ({
      type: 'shipping',
      status: s.status,
      shipperId: s.shipperId,
      time: s.createdAt,
      data: s
    })),
    ...(orderPostOffices || []).map(o => ({
      type: 'post_office',
      status: o.status,
      postOfficeId: o.postOfficeId,
      time: o.created_at,
      data: o
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  const STATUS_LABELS = {
    'PENDING': 'Chờ xử lý',
    'CANCELED': 'Đã hủy',
    'FINISHED': 'Hoàn thành',
    'PICKUP_REQUESTED': 'Yêu cầu lấy hàng',
    'IN_TRANSIT': 'Đang vận chuyển',
    'CLASSIFIED': 'Đã phân loại',
    'IN_WAREHOUSE': 'Tại kho',
    'SHIPPING': 'Đang giao hàng',
    'RETURNING': 'Đang hoàn hàng',
    'PICKUP_FAILED': 'Lấy hàng thất bại',
    'DELIVERY_FAILED': 'Giao thất bại'
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'CANCELED': 'bg-red-100 text-red-700 border-red-300',
      'FINISHED': 'bg-green-100 text-green-700 border-green-300',
      'PICKUP_REQUESTED': 'bg-blue-100 text-blue-700 border-blue-300',
      'IN_TRANSIT': 'bg-purple-100 text-purple-700 border-purple-300',
      'CLASSIFIED': 'bg-indigo-100 text-indigo-700 border-indigo-300',
      'IN_WAREHOUSE': 'bg-orange-100 text-orange-700 border-orange-300',
      'SHIPPING': 'bg-cyan-100 text-cyan-700 border-cyan-300',
      'RETURNING': 'bg-pink-100 text-pink-700 border-pink-300',
      'PICKUP_FAILED': 'bg-red-100 text-red-700 border-red-300',
      'DELIVERY_FAILED': 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  if (!allEvents.length) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        Chưa có thông tin lộ trình
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allEvents.map((event, index) => (
        <div key={index} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full border-2 ${
              index === 0 ? 'bg-orange-600 border-orange-600' : 'bg-white border-gray-300'
            }`} />
            {index < allEvents.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 my-1" />
            )}
          </div>

          <div className="flex-1 pb-4">
            <div className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(event.status)}`}>
              {STATUS_LABELS[event.status] || event.status}
            </div>
            
            <p className="text-sm text-gray-600 mt-1.5">
              {new Date(event.time).toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>

            <div className="mt-1 text-xs text-gray-500 space-y-0.5">
              {event.type === 'shipping' && event.shipperId && (
                <p>• Shipper ID: {event.shipperId}</p>
              )}
              {event.type === 'transition' && event.postOffice && (
                <p>• Bưu cục tiếp theo: {event.postOffice}</p>
              )}
              {event.type === 'post_office' && event.postOfficeId && (
                <p>• Bưu cục: {event.postOfficeId}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShippingJourney;