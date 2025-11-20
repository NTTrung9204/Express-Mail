import React from 'react';
import Close from '@mui/icons-material/Close';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import AttachMoney from '@mui/icons-material/AttachMoney';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import OrderTimeline from './OrderTimeline';
import ShippingJourney from './ShippingJourney';

import img_placeholder from "../../assets/img_placeholder.jpg";


const OrderDetailModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Chi tiết đơn hàng</h3>
            <p className="text-sm text-gray-500 mt-0.5">Mã: {order.code}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Close className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Tiến trình giao hàng</h4>
            <OrderTimeline order={order} />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <LocalShippingOutlined className="w-5 h-5 text-orange-600" />
              Lộ trình giao hàng
            </h4>
            <ShippingJourney 
              transitions={order.transitions}
              shipping={order.shipping}
              orderPostOffices={order.orderPostOffices}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <LocationOnOutlined className="w-5 h-5 text-orange-600" />
              Thông tin người nhận
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <PhoneOutlined className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{order.phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <LocationOnOutlined className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-900">{order.address}</p>
                  <p className="text-gray-500 text-xs mt-1">{order.ward}, {order.province}</p>
                  {order.coordinate && order.coordinate !== '-' && (
                    <p className="text-gray-400 text-xs mt-0.5">Tọa độ: {order.coordinate}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Inventory2Outlined className="w-5 h-5 text-orange-600" />
              Thông tin gói hàng
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Dài</p>
                <p className="text-gray-900 font-medium">{order.dimensions.length || 0} cm</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Rộng</p>
                <p className="text-gray-900 font-medium">{order.dimensions.width || 0} cm</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Cao</p>
                <p className="text-gray-900 font-medium">{order.dimensions.height || 0} cm</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Cân nặng</p>
                <p className="text-gray-900 font-medium">{order.weight}g</p>
              </div>
            </div>
          </div>

          {order.products.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Sản phẩm ({order.products.length})</h4>
              <div className="space-y-3">
                {order.products.map((product, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {product.img_url && (
                      <img 
                        src={product.img_url} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = {img_placeholder};
                          e.target.onerror = null; 
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>SL: {product.quantity}</span>
                        <span>•</span>
                        <span>{product.weight}kg</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AttachMoney className="w-5 h-5 text-orange-600" />
              Chi phí
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">COD</span>
                <span className="font-medium text-gray-900">{order.cod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="font-medium text-gray-900">
                  {order.shippingCost.toLocaleString()} đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Người trả phí</span>
                <span className="font-medium text-gray-900">{order.payer}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                <span className="text-gray-900 font-semibold">Tổng cộng</span>
                <span className="text-orange-600 font-semibold text-lg">{order.total}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Tạo lúc</span>
              <span className="text-gray-900">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cập nhật</span>
              <span className="text-gray-900">{new Date(order.updatedAt).toLocaleString('vi-VN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;