import { useState, useRef, useCallback } from "react";
import { permissionService } from "../api/permissionService";
import { postOfficeService } from "../api/postOfficeService";

export const usePermissionStore = () => {
  const [groups, setGroups] = useState([]);
  const [groupPermissions, setGroupPermissions] = useState({});
  const [userPermissions, setUserPermissions] = useState([]);
  const [postOffices, setPostOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const pendingFetches = useRef({});

  const fetchPostOffices = async (limit = 100) => {
    setLoading(true);
    setError(null);
    try {
      let page = 1;
      let all = [];

      while (true) {
        const res = await postOfficeService.getPostOffices(page, limit);
        const data =
          Array.isArray(res)
            ? res
            : Array.isArray(res.results)
            ? res.results
            : Array.isArray(res.data?.results)
            ? res.data.results
            : Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.items)
            ? res.items
            : [];

        if (data.length === 0) break;
        all = [...all, ...data];

        const hasNext =
          res.hasNext ||
          res.data?.hasNext ||
          (res.numPages && page < res.numPages) ||
          (res.data?.numPages && page < res.data.numPages) ||
          false;
        if (!hasNext) break;

        page++;
        if (page > 1000) break;
      }

      const simplified = all.map((po) => ({
        id: po.id,
        name: po.name || po.postOfficeName || `Bưu cục ${po.id}`,
      }));

      setPostOffices(simplified);
      return simplified;
    } catch (err) {
      console.error("Lỗi fetchPostOffices:", err);
      setError(err.message || String(err));
      setPostOffices([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await permissionService.getGroups();
      if (!Array.isArray(data)) throw new Error("Invalid groups data format");
      setGroups(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupPermissions = useCallback(
    async (groupId) => {
      if (!groupId) throw new Error("groupId is required");
      if (groupPermissions[groupId]) return groupPermissions[groupId];
      if (pendingFetches.current[groupId]) return pendingFetches.current[groupId];

      setError(null);
      const fetchPromise = (async () => {
        try {
          const data = await permissionService.getGroupPermissions(groupId);
          setGroupPermissions((prev) => ({ ...prev, [groupId]: data }));
          return data;
        } catch (err) {
          setError(err.message);
          throw err;
        } finally {
          delete pendingFetches.current[groupId];
        }
      })();

      pendingFetches.current[groupId] = fetchPromise;
      return fetchPromise;
    },
    [groupPermissions]
  );

  const fetchUserPermissions = async (userId) => {
    if (!userId) throw new Error("userId is required");
    setLoading(true);
    setError(null);
    try {
      const data = await permissionService.getUserPermissions(userId);
      setUserPermissions(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId) => {
    if (!userId) throw new Error("userId is required");
    setLoading(true);
    setError(null);
    try {
      const data = await permissionService.getUserProfile(userId);
      setUserProfile(data);
      return data;
    } catch (err) {
      console.error("Lỗi fetchUserProfile:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const roleUpdateMap = {
    admin: permissionService.updateAdminPermissions,
    post_office_manager: permissionService.updatePostOfficeManagerPermissions,
    post_office_staff: permissionService.updatePostOfficeStaffPermissions,
    shipper: permissionService.updateShipperPermissions,
    shop: permissionService.updateShopPermissions,
  };

  const groupToRoleMap = {
    1: "admin",
    2: "post_office_manager",
    3: "post_office_staff",
    4: "shop",
    5: "shipper",
  };

  const updateUserPermissions = async (user, perms, groupId = null) => {
    if (!user?.id) throw new Error("Invalid user data: Missing ID.");

    const effectiveRole = groupId
      ? groupToRoleMap[groupId]
      : user.role || null;
    if (!effectiveRole) throw new Error("Cannot determine role for update.");

    const updateFn = roleUpdateMap[effectiveRole];
    if (!updateFn)
      throw new Error(`Invalid role: ${effectiveRole}. Cannot find update API.`);

    let payload = {
      user: user.id,
      excludePermissions: perms,
    };

    if (["post_office_manager", "post_office_staff", "shipper"].includes(effectiveRole)) {
      payload.postOffice = user.postOffice;
    }

    if (effectiveRole === "shop") {
      payload.address = user.address || "";
      payload.phoneNumber = user.phoneNumber || "";
      payload.latitude = user.latitude ?? null;
      payload.longitude = user.longitude ?? null;
    }

    if (effectiveRole === "shipper") {
      payload = {
        ...payload,
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        motorModel: user.motorModel || "",
        licensePlateNumber: user.licensePlateNumber || "",
        avatar: user.avatar || "",
        cardId: user.cardId || "",
      };
    }

    setLoading(true);
    setError(null);
    try {
      const data = await updateFn(payload);
      setUserPermissions((prev) =>
        prev.map((p) => (p.user === user.id ? { ...p, ...data, role: effectiveRole } : p))
      );
      return data;
    } catch (err) {
      const apiErrorDetail = err.response?.data?.message || err.response?.data?.detail;
      const errorMsg = apiErrorDetail || err.message;
      setError(errorMsg);
      console.error("Lỗi API update quyền chi tiết:", err.response?.data || err);
      throw new Error(apiErrorDetail || "Cập nhật quyền thất bại. Vui lòng kiểm tra dữ liệu đầu vào.");
    } finally {
      setLoading(false);
    }
  };

  return {
    groups,
    groupPermissions,
    userPermissions,
    postOffices,
    userProfile,
    loading,
    error,
    fetchGroups,
    fetchGroupPermissions,
    fetchUserPermissions,
    fetchPostOffices,
    fetchUserProfile,
    updateUserPermissions,
  };
};
