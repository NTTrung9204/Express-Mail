import { Injectable } from '@nestjs/common';

import * as zlib from 'zlib';
import { PermissionEnum } from '../enums/permission.enum';

@Injectable()
export class PermissionService {
  decompressPermissions(compressedPermissions: string): PermissionEnum[] {
    if (!compressedPermissions) {
      return [];
    }

    try {
      const buffer = Buffer.from(compressedPermissions, 'base64');
      const decompressed = zlib.gunzipSync(buffer).toString('utf-8');
      return decompressed
        .split(',')
        .map((p) => p.trim() as PermissionEnum)
        .filter((p) => p.length > 0);
    } catch (error) {
      console.error('Failed to decompress permissions:', error);
      return [];
    }
  }

  hasPermission(
    userPermissions: string[],
    requiredPermissions: string[],
  ): boolean {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }

    return requiredPermissions.some((required) =>
      userPermissions.includes(required),
    );
  }
}
