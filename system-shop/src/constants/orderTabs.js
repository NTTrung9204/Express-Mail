export const ORDER_TABS = [
  { 
    id: 'pending',
    name: "Chờ xử lý", 
    path: "/orders/pending", 
    statuses: ["PENDING", "SHIPPING" , "RETURNING", "CREATED","DONE" ,"PICKUP_FAILED", "DELIVERY_FAILED", "TRANSITING"] 
  },
  { 
    id: 'order-pickup-requested',
    name: "Yêu cầu lấy hàng", 
    path: "/orders/order-pickup-requested", 
    statuses: ["PICKUP_REQUESTED"] 
  },
  { 
    id: 'completed',
    name: "Hoàn tất", 
    path: "/orders/completed", 
    statuses: ["FINISHED"] 
  },
  { 
    id: 'failed',
    name: "Đơn thất bại", 
    path: "/orders/failed", 
    statuses: ["CANCELED"] 
  },
];