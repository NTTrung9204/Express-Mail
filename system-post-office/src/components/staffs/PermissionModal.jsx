import React, { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';

const PermissionModal = ({ isOpen, staff, onClose, onSave }) => {
  const availablePermissions = [
    { id: 1, name: 'Quản lý đơn hàng', key: 'manage_orders' },
    { id: 2, name: 'Quản lý khách hàng', key: 'manage_customers' },
    { id: 3, name: 'Quản lý kho', key: 'manage_warehouse' },
    { id: 4, name: 'Quản lý giao hàng', key: 'manage_delivery' },
    { id: 5, name: 'Xem báo cáo', key: 'view_reports' },
    { id: 6, name: 'Quản lý tài chính', key: 'manage_finance' },
    { id: 7, name: 'Quản lý nhân viên', key: 'manage_staff' },
    { id: 8, name: 'Cài đặt hệ thống', key: 'system_settings' },
  ];

  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    if (isOpen && staff) {
      setSelectedPermissions([1, 3, 5]); 
    }
  }, [isOpen, staff]);

  const handleTogglePermission = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = () => {
    const permissions = availablePermissions
      .filter((p) => selectedPermissions.includes(p.id))
      .map((p) => p.key);
    onSave(permissions);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e)=>e.stopPropagation()}>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-white" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white">Phân quyền</h2>
              {staff && (
                <p className="text-orange-100 text-sm mt-0.5">
                  {staff.firstName} {staff.lastName} ({staff.username})
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-orange-700 rounded-lg p-1 transition cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <p className="text-gray-600 mb-4">
            Chọn các quyền bạn muốn cấp cho nhân viên này:
          </p>

          <div className="grid grid-cols-2 gap-3">
            {availablePermissions.map((permission) => (
              <label
                key={permission.id}
                className="flex items-center gap-3 p-4 border border-orange-200 rounded-lg hover:bg-orange-50 hover:border-orange-400 cursor-pointer transition-all group"
              >
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission.id)}
                  onChange={() => handleTogglePermission(permission.id)}
                  className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 group-hover:text-orange-700">
                      {permission.name}
                    </span>
                    {selectedPermissions.includes(permission.id) && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                        Đã cấp
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Mã: {permission.key}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800 font-medium">
              Đã chọn: {selectedPermissions.length} / {availablePermissions.length} quyền
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-medium flex items-center gap-2 cursor-pointer"
          >
            <Shield size={18} />
            Lưu quyền
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;