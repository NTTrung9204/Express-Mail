import pako from 'pako';

export const decodeToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

const base64ToUint8Array = (base64) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const decompressPermissions = (compressedPermissions) => {
  try {
    const compressed = base64ToUint8Array(compressedPermissions);
    const decompressed = pako.ungzip(compressed, { to: 'string' });
    return decompressed
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  } catch (error) {
    console.error('Failed to decompress permissions:', error);
    return [];
  }
};

export const extractPermissionsFromToken = (accessToken) => {
  const decoded = decodeToken(accessToken);
  
  if (!decoded || !decoded.permissions) {
    console.warn('No permissions found in token');
    return [];
  }
  
  return decompressPermissions(decoded.permissions);
};