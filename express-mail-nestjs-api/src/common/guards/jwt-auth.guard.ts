import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from '../@type/jwt-payload.type';
import { keysToCamel } from '../utils/key-to-camel.utils';
import { PermissionService } from '../services/permission.service';
import { WebhookService } from '../services/webhook.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(PermissionService)
    private readonly permissionService: PermissionService,
    @Inject(WebhookService)
    private readonly webhookService: WebhookService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer') {
      throw new UnauthorizedException('Bearer token is required');
    }

    if (!token) {
      throw new UnauthorizedException('Token is missing from Bearer header');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      const camelPayload = keysToCamel(payload);

      if (camelPayload.userId) {
        const isTokenValid = await this.webhookService.isTokenValid(
          camelPayload.userId,
          camelPayload.iat || Math.floor(Date.now() / 1000),
        );

        if (!isTokenValid) {
          throw new UnauthorizedException(
            'User permissions have been changed. Please login again.',
          );
        }
      }

      if (camelPayload.permissions) {
        camelPayload.decodedPermissions =
          this.permissionService.decompressPermissions(
            camelPayload.permissions,
          );
      }

      request['user'] = camelPayload;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
