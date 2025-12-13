import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const webhookSecretKey = process.env.WEBHOOK_SECRET_KEY;

    if (!apiKey) {
      throw new UnauthorizedException('Perrmission denied: API key missing');
    }

    if (apiKey !== webhookSecretKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
