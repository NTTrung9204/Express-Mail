import { Request } from 'express';
import { PermissionEnum } from '../enums/permission.enum';

export interface JwtPayload {
  userId: number;
  shopId?: number;
  postOfficeId?: string;
  permissions?: string;
  role?: string;
  expireAt?: Date;
  code?: string;
  decodedPermissions?: PermissionEnum[];
  iat?: number;
}

export interface AuthJwtRequest extends Request {
  user: JwtPayload;
}
