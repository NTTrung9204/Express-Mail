import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { PermissionService } from '../services/permission.service';
import { WebhookService } from '../services/webhook.service';
import { AuthJwtRequest, JwtPayload } from '../@type/jwt-payload.type';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
    private webhookService: WebhookService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,

      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request: AuthJwtRequest = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    if (!user?.decodedPermissions || user.decodedPermissions.length === 0) {
      throw new ForbiddenException('User has no permissions. Access denied.');
    }

    const isTokenValid = await this.webhookService.isTokenValid(
      user.userId,
      user.iat || Math.floor(Date.now() / 1000),
    );

    if (!isTokenValid) {
      throw new ForbiddenException(
        'Your permissions have been changed. Please re-login to get updated permissions.',
      );
    }

    const hasPermission = this.permissionService.hasPermission(
      user.decodedPermissions,

      requiredPermissions,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Required permissions: ${requiredPermissions.join(', ')}. Access denied.`,
      );
    }

    return true;
  }
}
