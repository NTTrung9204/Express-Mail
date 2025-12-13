import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../decorators/require-role.decorator';
import { AuthJwtRequest } from '../@type/jwt-payload.type';
import { RoleEnum } from '../enums/role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthJwtRequest>();
    const user = request.user;

    if (!user?.role) {
      throw new ForbiddenException('User has no role. Access denied.');
    }

    const hasRole = requiredRoles.includes(user.role as RoleEnum);

    if (!hasRole) {
      throw new ForbiddenException(
        `Required roles: ${requiredRoles.join(', ')}. Your role: ${user.role}. Access denied.`,
      );
    }

    return true;
  }
}
