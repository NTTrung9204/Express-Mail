import { useState, useEffect } from "react";
import { getPermissionsFromToken } from "../utils/tokenPermissionUtil";
import { normalizePermissions } from "../utils/permissionUtil";

export const useUserPermissions = () => {
  const [permissions, setPermissions] = useState({});
  const [excludePermissionIds, setExcludePermissionIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      setIsLoading(true);

      const rawPermissions = getPermissionsFromToken();
      if (!rawPermissions) {
        throw new Error("Permissions not found in token");
      }

      const normalizedPermissions = normalizePermissions(rawPermissions);
      setPermissions(normalizedPermissions);

      setExcludePermissionIds([]);

    } catch (err) {
      console.error(err);
      setError("Failed to load permissions from token");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { permissions, excludePermissionIds, isLoading, error };
};
