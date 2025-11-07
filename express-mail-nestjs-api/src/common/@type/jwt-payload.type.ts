import { Request } from 'express';
import { PermissionEnum } from '../enums/permission.enum';

export interface JwtPayload {
  userId: number;
  shopId?: number;
  managedPostOfficeId?: string;
  permissions: PermissionEnum[];
  expireAt: Date;
  code: string;
}

export interface AuthJwtRequest extends Request {
  user: JwtPayload;
}
