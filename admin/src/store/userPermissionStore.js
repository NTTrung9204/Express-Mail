import { useState, useRef, useCallback } from "react";
import { permissionService } from "../api/permissionService";

export const usePermissionStore = () => {
  const [groups, setGroups] = useState([]);
  const [groupPermissions, setGroupPermissions] = useState({});
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map to store pending promises to prevent concurrent fetches for the same groupId
  const pendingFetches = useRef({}); 

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await permissionService.getGroups();
      if (!Array.isArray(data)) {
        throw new Error("Invalid groups data format");
      }
      setGroups(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupPermissions = useCallback(async (groupId) => {
    if (!groupId) {
      throw new Error("groupId is required");
    }
    
    // 1. Check cache first
    if (groupPermissions[groupId]) {
      return groupPermissions[groupId];
    }
    
    // 2. Check if a fetch is already in progress
    if (pendingFetches.current[groupId]) {
        // Return the existing promise, ensuring only one API call per group
        return pendingFetches.current[groupId];
    }
    
    // 3. Start a new fetch (Bỏ setLoading để tránh re-render liên tục)
    setError(null);
    
    const fetchPromise = (async () => {
      try {
        const data = await permissionService.getGroupPermissions(groupId);
        setGroupPermissions((prev) => ({ ...prev, [groupId]: data }));
        return data;
      } catch (err) {
        setError(err.message);
        // Lưu ý: Không ném lỗi để Promise.all không bị dừng ngay lập tức
        throw err; 
      } finally {
        // 4. Clean up
        delete pendingFetches.current[groupId];
      }
    })();
    
    pendingFetches.current[groupId] = fetchPromise;
    
    return fetchPromise;
  }, [groupPermissions]); // Dependency on groupPermissions ensures cache check is fresh

  const fetchUserPermissions = async (userId) => {
    if (!userId) {
      throw new Error("userId is required");
    }
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

  const roleUpdateMap = {
    superadmin: permissionService.updateAdminPermissions,
    postOfficeManager: permissionService.updatePostOfficeManagerPermissions,
    staff: permissionService.updatePostOfficeStaffPermissions,
    shipper: permissionService.updateShipperPermissions,
    shopOwner: permissionService.updateShopPermissions,
  };

  const updateUserPermissions = async (user, perms) => {
    if (!user?.id || !user?.role) {
      throw new Error("Invalid user data");
    }
    const updateFn = roleUpdateMap[user.role];
    if (!updateFn) {
      throw new Error(`Invalid role: ${user.role}`);
    }
    setLoading(true);
    setError(null);
    try {
      const data = await updateFn({
        user: user.id,
        postOffice: user.postOffice, // Nếu cần
        excludePermissions: perms,
      });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    groups,
    groupPermissions,
    userPermissions,
    loading,
    error,
    fetchGroups,
    fetchGroupPermissions,
    fetchUserPermissions,
    updateUserPermissions,
  };
};