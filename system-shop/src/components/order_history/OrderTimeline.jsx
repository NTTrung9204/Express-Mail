import React from 'react';
import TripOrigin from '@mui/icons-material/TripOrigin';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import WarehouseOutlined from '@mui/icons-material/WarehouseOutlined';
import Close from '@mui/icons-material/Close';
import KeyboardReturn from '@mui/icons-material/KeyboardReturn';

const OrderTimeline = ({ order }) => {
  const status = order.shippingStatusRaw;

  const allSteps = [
    { status: 'PICKUP_REQUESTED',  label: 'Yêu cầu lấy hàng', icon: TripOrigin },
    { status: 'CLASSIFIED',        label: 'Đã phân loại',     icon: Inventory2Outlined },
    { status: 'IN_WAREHOUSE',      label: 'Tại kho',          icon: WarehouseOutlined },
    { status: 'IN_TRANSIT',        label: 'Đang vận chuyển',  icon: LocalShippingOutlined },
    { status: 'SHIPPING',          label: 'Đang giao',        icon: LocalShippingOutlined },
    { status: 'FINISHED',          label: 'Hoàn thành',       icon: CheckCircleOutline },
  ];

  let currentIndex = allSteps.findIndex(item => item.status === status);

  const isFailed = status === 'PICKUP_FAILED' || status === 'DELIVERY_FAILED';
  const isReturning = status === 'RETURNING';

  if (isReturning) {
    allSteps.push({ status: 'RETURNING', label: 'Đang trả hàng', icon: KeyboardReturn });
    currentIndex = allSteps.length - 1;
  }

  return (
    <div className="relative">
      <div className="flex items-start justify-between">
        {allSteps.map((item, index) => {
          const Icon = item.icon;

          const isPast = index < currentIndex && !isFailed && !isReturning;
          const isCurrent = index === currentIndex;
          const isFailedStep = isFailed && (index === currentIndex || index === currentIndex - 1);
          const isReturnStep = isReturning && index === allSteps.length - 1;

          return (
            <div key={item.status || index} className="flex-1 relative flex flex-col items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 relative ${
                    isCurrent
                      ? isFailedStep
                        ? 'bg-red-100 ring-4 ring-red-200'
                        : isReturnStep
                        ? 'bg-pink-100 ring-4 ring-pink-200'
                        : 'bg-orange-100 ring-4 ring-orange-200'
                      : isPast
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                  }`}
                >
                  {isFailedStep ? (
                    <Close className="w-6 h-6 text-red-600" />
                  ) : (
                    <Icon
                      className={`w-5 h-5 ${
                        isCurrent
                          ? isReturnStep
                            ? 'text-pink-600'
                            : 'text-orange-600'
                          : isPast
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    />
                  )}
                </div>
              </div>

              <span
                className={`mt-3 text-xs font-medium text-center max-w-[80px] leading-tight ${
                  isPast || (isCurrent && !isFailed) ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>

              {index < allSteps.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 right-0 h-0.5 -z-0 transition-colors pointer-events-none ${
                    isPast
                      ? 'bg-green-500'
                      : isFailed && index >= currentIndex - 1
                      ? 'bg-red-400'
                      : isReturning && index === allSteps.length - 2
                      ? 'bg-pink-500'
                      : 'bg-gray-200'
                  }`}
                  style={{ width: 'calc(100% - 20px)', left: '50%' }}
                >
                  {isReturning && index === allSteps.length - 2 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-pink-500" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;