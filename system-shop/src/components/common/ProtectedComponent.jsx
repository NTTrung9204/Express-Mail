import React from 'react';

const ProtectedComponent = ({ perm, mode = 'any', children, fallback = null }) => {
  const getPermissions = () => {
    try {
      const permissionsStr = localStorage.getItem('permissions');
      return permissionsStr ? JSON.parse(permissionsStr) : [];
    } catch (error) {
      console.error('Failed to get permissions from localStorage:', error);
      return [];
    }
  };

  const permissions = getPermissions();

  let hasPermission = false;

  if (Array.isArray(perm)) {
    if (perm.length === 0) {
      hasPermission = true; 
    } else if (mode === 'all') {
      hasPermission = perm.every(p => permissions.includes(p));
    } else {
      hasPermission = perm.some(p => permissions.includes(p));
    }
  } else if (typeof perm === 'string') {
    hasPermission = permissions.includes(perm);
  } else {
    hasPermission = true;
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export default ProtectedComponent;