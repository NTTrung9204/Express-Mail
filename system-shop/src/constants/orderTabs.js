export const ORDER_TABS = [
  { 
    id: 'pending',
    name: "Chờ xử lý", 
    path: "/orders/pending", 
    statuses: ["PENDING"] 
  },
  { 
    id: 'order-pickup-requested',
    name: "Yêu cầu lấy hàng", 
    path: "/orders/order-pickup-requested", 
    statuses: ["PICKUP_REQUESTED"] 
  },
  { 
    id: 'order-delivery',
    name: "Đang vận chuyển",  
    path: "/orders/order-delivery", 
    statuses: ["IN_TRANSIT"] 
  },
  { 
    id: 'order-transit',
    name: "Đang giao hàng", 
    path: "/orders/order-delivery", 
    statuses: ["IN_TRANSIT", "SHIPPING"] 
  },
  { 
    id: 'returning',
    name: "Đang hoàn hàng", 
    path: "/orders/returning", 
    statuses: ["RETURNING"] 
  },
  { 
    id: 'completed',
    name: "Hoàn tất", 
    path: "/orders/completed", 
    statuses: ["COMPLETED"] 
  },
  { 
    id: 'failed',
    name: "Đơn thất bại", 
    path: "/orders/failed", 
    statuses: ["PICKUP_FAILED","DELIVERY_FAILED"] 
  },
];