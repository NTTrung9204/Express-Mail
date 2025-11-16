import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from '../@type/jwt-payload.type';
import { keysToCamel } from '../utils/key-to-camel.utils';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    console.log('Request headers:', request.headers);
    const authHeader = request.headers.authorization;
    console.log('Auth Header:', authHeader);

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [type, token] = authHeader.split(' ');
    console.log(
      'Auth type:',
      type,
      'Token:',
      token ? '(present)' : '(missing)',
    );

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

      console.log('payload', payload);

      request['user'] = keysToCamel(payload);

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
