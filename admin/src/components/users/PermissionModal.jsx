import React, { useEffect, useState } from "react";
import { Checkbox, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import { toast } from "react-toastify";
import { usePermissionStore } from "../../store/userPermissionStore";
import VietmapPicker from "../common/VietmapPicker";

import permissionData from "../../data/permissions.json";

const permissionViMap = permissionData.reduce((acc, perm) => {
  if (!acc[perm.contentTypeId]) acc[perm.contentTypeId] = {};
  acc[perm.contentTypeId][perm.id] = perm.name_vi;
  return acc;
}, {});

const contentTypeNames = {
  1: "Admin",
  2: "Trưởng bưu cục",
  3: "Nhân viên bưu cục",
  4: "Cửa hàng",
  5: "Shipper",
};

const roleToGroupMap = {
  admin: 1,
  post_office_manager: 2,
  post_office_staff: 3,
  shop: 4,
  shipper: 5,
};

const groupToRoleMap = {
  1: "admin",
  2: "post_office_manager",
  3: "post_office_staff",
  4: "shop",
  5: "shipper",
};

export default function PermissionModal({
  open,
  onClose,
  excludePermissions,
  setExcludePermissions,
  isView,
  user,
  onRoleChange,
}) {
  const [isPermissionsLoading, setIsPermissionsLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedPostOffice, setSelectedPostOffice] = useState(user?.postOffice || "");
  const [userProfile, setUserProfile] = useState({});
  const [errors, setErrors] = useState({});

  const {
    groups,
    groupPermissions,
    postOffices,
    fetchGroups,
    fetchGroupPermissions,
    fetchPostOffices,
    fetchUserProfile,
    updateUserPermissions,
    loading,
  } = usePermissionStore();

  const isSaving = loading;
  const currentRole = selectedGroup ? groupToRoleMap[selectedGroup] : null;

  const hasPermission = (permId) => !excludePermissions.includes(permId);

  const handleTogglePermission = (permId) => {
    if (isView) return;
    if (hasPermission(permId)) {
      setExcludePermissions([...excludePermissions, permId]);
    } else {
      setExcludePermissions(excludePermissions.filter((id) => id !== permId));
    }
  };

  const handleSelectAll = (permissions) => {
    const allSelected = permissions.every((p) => hasPermission(p.id));
    let newExclude;
    if (allSelected) {
      newExclude = [...new Set([...excludePermissions, ...permissions.map((p) => p.id)])];
    } else {
      const groupPermIds = new Set(permissions.map((p) => p.id));
      newExclude = excludePermissions.filter((id) => !groupPermIds.has(id));
    }
    setExcludePermissions(newExclude);
  };

  const validateFields = () => {
    const currentRole = groupToRoleMap[selectedGroup];
    const newErrors = {};

    if (!selectedGroup) newErrors.role = "Vui lòng chọn vai trò.";

    if (["post_office_manager", "post_office_staff", "shipper"].includes(currentRole) && !selectedPostOffice) {
      newErrors.postOffice = "Vui lòng chọn bưu cục.";
    }

    if (currentRole === "shop") {
      if (!userProfile.address?.trim()) newErrors.address = "Vui lòng nhập địa chỉ.";
      if (!userProfile.phoneNumber?.trim()) newErrors.phoneNumber = "Vui lòng nhập số điện thoại.";
      else if (!/^0\d{8,10}$/.test(userProfile.phoneNumber)) {
        newErrors.phoneNumber = "Số điện thoại không hợp lệ (9-11 số).";
      }
      if (!userProfile.latitude) newErrors.latitude = "Vui lòng chọn vĩ độ.";
      if (!userProfile.longtitude) newErrors.longtitude = "Vui lòng chọn kinh độ.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSavePermissions = async () => {
    if (isView || isSaving || !user?.id || !selectedGroup) return;

    if (!validateFields()) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }

    try {
      const updatedUser = {
        ...user,
        postOffice: selectedPostOffice,
        ...userProfile,
      };
      await updateUserPermissions(updatedUser, excludePermissions, selectedGroup);
      toast.success("Cập nhật quyền thành công!");

      if (typeof onRoleChange === "function") {
        onRoleChange(groupToRoleMap[selectedGroup]);
      }
      onClose();
    } catch (err) {
      toast.error("Lỗi lưu quyền: " + (err.message || "Không xác định"));
    }
  };

  const loadGroupPermissions = async (gId) => {
    if (!groupPermissions[gId]) {
      setIsPermissionsLoading(true);
      try {
        await fetchGroupPermissions(gId);
      } catch (err) {
        toast.error("Không thể tải quyền: " + err.message);
      } finally {
        setIsPermissionsLoading(false);
      }
    }
  };

  const loadPostOfficesIfNeeded = async () => {
    if (postOffices.length > 0) return;
    try {
      await fetchPostOffices();
    } catch {
      toast.error("Không thể tải danh sách bưu cục.");
    }
  };

  useEffect(() => {
    if (!open) return;

    const init = async () => {
      setErrors({});
      if (!groups.length) await fetchGroups();

      let currentRole = null;
      if (user?.role) {
        const gId = roleToGroupMap[user.role];
        setSelectedGroup(gId);
        await loadGroupPermissions(gId);
        currentRole = user.role;
      }

      if (["post_office_manager", "post_office_staff", "shipper", "shop"].includes(currentRole)) {
        const profile = await fetchUserProfile(user.id);
        if (profile?.postOffice) setSelectedPostOffice(profile.postOffice);

        if (currentRole === "shop") {
          setUserProfile({
            address: profile.address || "",
            phoneNumber: profile.phoneNumber || "",
            latitude: profile.latitude ?? "",
            longtitude: profile.longtitude ?? ""
          });
        }
      }

      if (["post_office_manager", "post_office_staff", "shipper"].includes(currentRole)) {
        await loadPostOfficesIfNeeded();
      }
    };

    init();
  }, [open, user?.role]);

  const handleRoleChange = async (e) => {
    const gId = e.target.value;
    const newRole = groupToRoleMap[gId];

    setSelectedGroup(gId);
    setErrors({});
    await loadGroupPermissions(gId);

    if (["post_office_manager", "post_office_staff", "shipper"].includes(newRole)) {
      await loadPostOfficesIfNeeded();
      const profile = await fetchUserProfile(user.id);
      if (profile?.postOffice) setSelectedPostOffice(profile.postOffice);
    }

    if (newRole === "shop") {
      const profile = await fetchUserProfile(user.id);
      setUserProfile({
        address: profile.address || "",
        phoneNumber: profile.phoneNumber || "",
        latitude: profile.latitude ?? "",
        longtitude: profile.longtitude ?? ""
      });
    } else {
      setUserProfile({});
    }
  };

  if (!open) return null;

  const permissions = selectedGroup ? groupPermissions[selectedGroup] || [] : [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl rounded-xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white z-10 border-b p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
            <LockOutlined className="text-orange-500" />
            Hồ sơ người dùng {isView ? "(Xem)" : ""}
          </h2>
          <button onClick={onClose} className="text-3xl leading-none hover:text-orange-600" disabled={isPermissionsLoading || isSaving}>
            ×
          </button>
        </div>

        <div className="p-6 space-y-6 mb-4">
          <div className="space-y-4">
            {isView && !user?.role ? (
              <div className="w-full p-2 bg-gray-100 text-gray-500 rounded-md text-center">
                Chưa có vai trò
              </div>
            ) : (
              <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.role}>
                <InputLabel id="role-select-label">Chọn vai trò</InputLabel>
                <Select
                  labelId="role-select-label"
                  value={selectedGroup || ""}
                  label="Chọn vai trò"
                  onChange={handleRoleChange}
                  disabled={isView || isSaving}
                >
                  <MenuItem value="">Chọn vai trò</MenuItem>
                  {Object.entries(contentTypeNames).map(([id, name]) => (
                    <MenuItem key={id} value={Number(id)}>{name}</MenuItem>
                  ))}
                </Select>
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
              </FormControl>
            )}

            {selectedGroup && ["post_office_manager", "post_office_staff", "shipper"].includes(currentRole) && (
              <div>
                <FormControl fullWidth error={!!errors.postOffice}>
                  <InputLabel id="postoffice-select-label">Chọn bưu cục</InputLabel>
                  <Select
                    labelId="postoffice-select-label"
                    value={selectedPostOffice}
                    onChange={(e) => setSelectedPostOffice(e.target.value)}
                    disabled={isView}
                  >
                    <MenuItem value="">Chọn bưu cục</MenuItem>
                    {postOffices.map((po) => (
                      <MenuItem key={po.id} value={po.id}>{po.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {errors.postOffice && <p className="text-red-500 text-sm mt-1">{errors.postOffice}</p>}
              </div>
            )}

            {currentRole === "shop" && (
              <>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <input
                      type="text"
                      className={`border rounded-md p-2 text-sm w-full outline-none focus:ring-2 focus:ring-orange-300 ${errors.address ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Địa chỉ"
                      value={userProfile.address || ""}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, address: e.target.value }))}
                      disabled={isView}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      className={`border rounded-md p-2 text-sm w-full outline-none focus:ring-2 focus:ring-orange-300 ${errors.phoneNumber ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Số điện thoại"
                      value={userProfile.phoneNumber || ""}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      disabled={isView}
                    />
                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                  </div>
                </div>

                {isView && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <input
                        type="text"
                        value={userProfile.latitude || ""}
                        readOnly
                        placeholder="Vĩ độ (Latitude)"
                        className="border rounded-md p-2 text-sm w-full bg-gray-50 text-gray-700"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={userProfile.longtitude || ""}
                        readOnly
                        placeholder="Kinh độ (Longitude)"
                        className="border rounded-md p-2 text-sm w-full bg-gray-50 text-gray-700"
                      />
                    </div>
                  </div>
                )}

                {!isView && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn vị trí trên bản đồ
                    </label>
                    <VietmapPicker
                      latitude={userProfile.latitude}
                      longitude={userProfile.longtitude}
                      address={userProfile.address}
                      onChange={({ latitude, longitude, address }) => {
                        setUserProfile(prev => ({
                          ...prev,
                          latitude,
                          longtitude: longitude,
                          address: address || prev.address,
                        }));
                      }}
                      disabled={isView}
                      hideSearch = {false}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {selectedGroup && (
            <>
              {isPermissionsLoading ? (
                <div className="text-center text-orange-500">
                  Đang tải quyền...
                </div>
              ) : permissions.length === 0 ? (
                <div className="text-center text-gray-500 italic">
                  Không có quyền nào.
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Checkbox
                      color="warning"
                      checked={permissions.every((p) => hasPermission(p.id))}
                      onChange={() => handleSelectAll(permissions)}
                      disabled={isView}
                    />
                    <span className="font-medium">Chọn tất cả</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2">
                    {permissions.map((perm) => {
                      const viName = permissionViMap[selectedGroup]?.[perm.id];
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-center gap-2 select-none rounded-md px-2 py-1 ${!isView ? "cursor-pointer hover:bg-gray-50" : "opacity-70"}`}
                        >
                          <Checkbox
                            color="warning"
                            disabled={isView}
                            checked={hasPermission(perm.id)}
                            onChange={() => handleTogglePermission(perm.id)}
                          />
                          {viName || perm.name}
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end p-6 border-t bg-white sticky bottom-0 gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
            disabled={isSaving}
          >
            Đóng
          </button>
          {!isView && (
            <button
              onClick={handleSavePermissions}
              className={`px-5 py-2 rounded-lg text-white ${
                currentRole === "shipper"
                  ? "bg-gray-400 cursor-not-allowed"
                  : (isSaving || isPermissionsLoading || !selectedGroup)
                  ? "bg-orange-300 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 cursor-pointer"
              }`}
              disabled={isSaving || isPermissionsLoading || !selectedGroup || currentRole === "shipper"}
            >
              {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}