import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import { toast } from "react-toastify";
import { usePermissionStore } from "../../store/userPermissionStore";
import VietmapPicker from "../common/VietmapPicker";
import ProtectedComponent from "../common/ProtectedComponent";

import permissionTranslations from "../../data/permissions.json";

const contentTypeNames = {
  1: "Quản trị viên (Admin)",
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
  excludePermissions = [],
  setExcludePermissions,
  isView = false,
  user,
  onRoleChange,
}) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedPostOffice, setSelectedPostOffice] = useState(user?.postOffice || "");
  const [userProfile, setUserProfile] = useState({});
  const [errors, setErrors] = useState({});
  const [isPermissionsLoading, setIsPermissionsLoading] = useState(false);
  const [isRoleProhibited, setIsRoleProhibited] = useState(false); 
  
  const mapPickerRef = useRef(null);

  const {
    groups,
    groupPermissions,
    postOffices,
    fetchGroups,
    fetchGroupPermissions,
    fetchPostOffices,
    fetchUserProfile,
    updateUserPermissions,
    loading: storeLoading,
  } = usePermissionStore();

  const isSaving = storeLoading;
  const currentRole = selectedGroup ? groupToRoleMap[selectedGroup] : null;

  const nameToVietnamese = useMemo(() => {
    const map = {};
    permissionTranslations.forEach((item) => {
      if (item.name) {
        map[item.name] = item.name_vi || item.name;
      }
    });
    return map;
  }, []);

  const hasPermission = (permId) => !excludePermissions.includes(permId);

  const handleTogglePermission = (permId) => {
    if (isView) return;
    if (hasPermission(permId)) {
      setExcludePermissions([...excludePermissions, permId]);
    } else {
      setExcludePermissions(excludePermissions.filter((id) => id !== permId));
    }
  };

  const handleSelectAll = () => {
    if (!selectedGroup) return;
    const perms = groupPermissions[selectedGroup] || [];
    const allSelected = perms.every((p) => hasPermission(p.id));

    if (allSelected) {
      setExcludePermissions([
        ...new Set([...excludePermissions, ...perms.map((p) => p.id)]),
      ]);
    } else {
      setExcludePermissions(
        excludePermissions.filter((id) => !perms.some((p) => p.id === id))
      );
    }
  };

  const validateFields = () => {
    const newErrors = {};
    if (!selectedGroup) newErrors.role = "Vui lòng chọn vai trò.";
    
    if (currentRole === "shipper") {
        newErrors.prohibited = "Chỉ Chủ kho mới có quyền chỉnh sửa người dùng Shipper.";
    }

    if (
      ["post_office_manager", "post_office_staff", "shipper"].includes(currentRole) &&
      !selectedPostOffice
    ) {
      newErrors.postOffice = "Vui lòng chọn bưu cục.";
    }

    if (currentRole === "shop") {
      if (!userProfile.address?.trim()) newErrors.address = "Vui lòng nhập địa chỉ.";
      if (!userProfile.phoneNumber?.trim()) newErrors.phoneNumber = "Vui lòng nhập số điện thoại.";
      else if (!/^0\d{8,10}$/.test(userProfile.phoneNumber))
        newErrors.phoneNumber = "Số điện thoại không hợp lệ.";
      if (userProfile.latitude === null || userProfile.latitude === undefined || userProfile.latitude === "") 
        newErrors.latitude = "Vui lòng chọn vị trí trên bản đồ.";
      if (userProfile.longitude === null || userProfile.longitude === undefined || userProfile.longitude === "") 
        newErrors.longitude = "Vui lòng chọn vị trí trên bản đồ.";
    }

    setErrors(newErrors);
    setIsRoleProhibited(!!newErrors.prohibited); 

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (isView || isSaving || !user?.id || !selectedGroup) return;
    if (!validateFields()) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }
    
    if (isRoleProhibited) {
        toast.error("Bạn không có quyền lưu thay đổi cho vai trò này.");
        return;
    }

    try {
      const sanitizedProfile = {
        ...userProfile,
        longitude: userProfile.longitude !== "" && userProfile.longitude !== null ? String(userProfile.longitude) : null,
        latitude: userProfile.latitude !== "" && userProfile.latitude !== null ? String(userProfile.latitude) : null,
      };

      const updatedUser = {
        ...user,
        postOffice: selectedPostOffice,
        ...sanitizedProfile,
      };
      await updateUserPermissions(updatedUser, excludePermissions, selectedGroup);
      toast.success("Cập nhật quyền thành công!");
      onRoleChange?.(groupToRoleMap[selectedGroup]);
      onClose();
    } catch (err) {
      toast.error(err.message || "Lỗi lưu quyền không xác định.");
    }
  };
  
  const getSafeCoordinate = (coord) => {
    if (coord !== null && coord !== undefined && coord !== "") {
        const parsed = parseFloat(coord);
        return isNaN(parsed) ? "" : parsed;
    }
    return "";
  };

  const loadProfileAndSetState = async (u) => {
    const profile = await fetchUserProfile(u.id);
    
    if (u.role === "shop") {
        const lat = getSafeCoordinate(profile.latitude);
        const lng = getSafeCoordinate(profile.longitude);

        setUserProfile({
            address: profile.address || "",
            phoneNumber: profile.phoneNumber || "",
            latitude: lat,
            longitude: lng,
        });

        if (mapPickerRef.current && lat !== "" && lng !== "") {
            mapPickerRef.current.flyTo([lng, lat]);
        }
    } else {
        setUserProfile({});
        setSelectedPostOffice(profile.postOffice || "");
    }

    return profile;
  }

  const loadGroupPermissions = async (gId) => {
    if (groupPermissions[gId]) return;
    setIsPermissionsLoading(true);
    try {
      await fetchGroupPermissions(gId);
    } catch (err) {
      toast.error("Không thể tải quyền: " + err.message);
    } finally {
      setIsPermissionsLoading(false);
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
      setIsRoleProhibited(user?.role === "shipper");

      if (!groups.length) await fetchGroups();

      if (user?.role) {
        const gId = roleToGroupMap[user.role];
        if (gId) {
          setSelectedGroup(gId);
          await loadGroupPermissions(gId);
        }
      }

      if (["post_office_manager", "post_office_staff", "shipper", "shop"].includes(user?.role)) {
        await loadProfileAndSetState(user);
      }

      if (["post_office_manager", "post_office_staff", "shipper"].includes(user?.role)) {
        await loadPostOfficesIfNeeded();
      }
    };

    init();
  }, [open, user]);

  const handleRoleChange = async (e) => {
    const gId = e.target.value;
    const newRole = groupToRoleMap[gId];

    setSelectedGroup(gId);
    setErrors({});
    
    setIsRoleProhibited(newRole === "shipper");

    await loadGroupPermissions(gId);

    if (["post_office_manager", "post_office_staff", "shipper"].includes(newRole)) {
      await loadPostOfficesIfNeeded();
      const profile = await fetchUserProfile(user.id);
      setSelectedPostOffice(profile.postOffice || "");
      setUserProfile({});
    }

    if (newRole === "shop") {
      await loadProfileAndSetState({ id: user.id, role: newRole });
      setSelectedPostOffice("");
    } else {
      setUserProfile({});
      setSelectedPostOffice("");
    }
  };

  if (!open) return null;

  const permissions = selectedGroup ? groupPermissions[selectedGroup] || [] : [];
  const allSelected = permissions.length > 0 && permissions.every((p) => hasPermission(p.id));

  const isSaveDisabled = isSaving || !selectedGroup || isRoleProhibited;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-orange-600">
            <LockOutlined className="text-3xl" />
            Quản lý quyền người dùng {isView ? "(Chỉ xem)" : ""}
          </h2>
          <button onClick={onClose} className="text-4xl leading-none hover:text-red-500">
            ×
          </button>
        </div>

        <div className="flex flex-col gap-5 mt-3 p-6">
        <ProtectedComponent perm="auth.view_group">
          <FormControl fullWidth error={!!errors.role}>
            <InputLabel>Chọn vai trò</InputLabel>
            <Select
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
            {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role}</p>}
          </FormControl>
        </ProtectedComponent>
          
          {isRoleProhibited && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                  <p className="font-semibold">
                      Quyền chỉnh sửa bị hạn chế:
                  </p>
                  <p className='mt-1'>
                      Chỉ Trưởng bưu cục mới có quyền chỉnh sửa thông tin/phân quyền cho người dùng Shipper.
                  </p>
              </div>
          )}

          {selectedGroup && ["post_office_manager", "post_office_staff", "shipper"].includes(currentRole) && (
            <FormControl fullWidth error={!!errors.postOffice}>
              <InputLabel>Chọn bưu cục</InputLabel>
              <Select
                value={selectedPostOffice}
                label="Chọn bưu cục"
                onChange={(e) => setSelectedPostOffice(e.target.value)}
                disabled={isView}
              >
                <MenuItem value="">Chọn bưu cục</MenuItem>
                {postOffices.map((po) => (
                  <MenuItem key={po.id} value={po.id}>{po.name}</MenuItem>
                ))}
              </Select>
              {errors.postOffice && <p className="mt-1 text-sm text-red-500">{errors.postOffice}</p>}
            </FormControl>
          )}

          {currentRole === "shop" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Địa chỉ"
                    className={`w-full rounded-md border p-3 text-sm focus:ring-2 focus:ring-orange-300 outline-none ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                    value={userProfile.address || ""}
                    onChange={(e) => setUserProfile(p => ({ ...p, address: e.target.value }))}
                    disabled={isView}
                  />
                  {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Số điện thoại"
                    className={`w-full rounded-md border p-3 text-sm focus:ring-2 focus:ring-orange-300 outline-none ${
                      errors.phoneNumber ? "border-red-500" : "border-gray-300"
                    }`}
                    value={userProfile.phoneNumber || ""}
                    onChange={(e) => setUserProfile(p => ({ ...p, phoneNumber: e.target.value }))}
                    disabled={isView}
                  />
                  {errors.phoneNumber && <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>}
                </div>
              </div>

              {!isView && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Chọn vị trí trên bản đồ
                  </label>
                  <VietmapPicker
                    ref={mapPickerRef} 
                    latitude={userProfile.latitude}
                    longitude={userProfile.longitude}
                    address={userProfile.address}
                    onChange={({ latitude, longitude, address }) => {
                      setUserProfile(p => ({
                        ...p,
                        latitude: parseFloat(latitude), 
                        longitude: parseFloat(longitude), 
                        address: address || p.address,
                      }));
                    }}
                    disabled={isView}
                  />
                  {(errors.latitude || errors.longitude) && 
                    <p className="mt-1 text-sm text-red-500">
                        {errors.latitude || errors.longitude}
                    </p>
                  }
                </div>
              )}
            </div>
          )}

          {selectedGroup && (
            <div className="pt-8">
              <h3 className="mb-6 text-lg font-semibold text-gray-800">
                Quyền hạn – {contentTypeNames[selectedGroup]}
              </h3>

              {isPermissionsLoading ? (
                <p className="py-8 text-center text-orange-500">Đang tải quyền...</p>
              ) : permissions.length === 0 ? (
                <p className="py-8 text-center italic text-gray-500">Không có quyền nào.</p>
              ) : (
                <>
                  <div className="mb-6 flex items-center gap-3">
                    <Checkbox
                      color="warning"
                      checked={allSelected}
                      indeterminate={!allSelected && permissions.some(p => hasPermission(p.id))}
                      onChange={handleSelectAll}
                      disabled={isView}
                    />
                    <span className="font-medium text-gray-700">Chọn / Bỏ chọn tất cả</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permissions.map((perm) => {
                      const displayName = nameToVietnamese[perm.name] || perm.name;

                      return (
                        <label
                          key={perm.id}
                          className={`flex items-center gap-4 rounded-lg border-2 p-4 transition-all ${
                            hasPermission(perm.id)
                              ? "border-orange-200 bg-orange-50"
                              : "border-gray-200 bg-gray-50 opacity-70"
                          } ${!isView ? "cursor-pointer hover:border-orange-400" : ""}`}
                        >
                          <Checkbox
                            color="warning"
                            checked={hasPermission(perm.id)}
                            onChange={() => handleTogglePermission(perm.id)}
                            disabled={isView}
                          />
                          <span className="text-sm font-medium text-gray-800">{displayName}</span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-4 border-t bg-white p-6">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-6 py-3 hover:bg-gray-300"
            disabled={isSaving}
          >
            Đóng
          </button>

          {!isView && (
            <button
              onClick={handleSave}
              disabled={isSaveDisabled} 
              className={`rounded-lg px-8 py-3 font-medium text-white ${
                isSaveDisabled
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}