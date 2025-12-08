import {
  Controller,
  Post,
  Body,
  UseGuards,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { WebhookService } from 'src/common/services/webhook.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { RequireRole } from 'src/common/decorators/require-role.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { PermissionChangeDto } from 'src/common/dto/permission-change.dto';
import { AuthJwtRequest } from 'src/common/@type/jwt-payload.type';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}
  @Post('permission-change')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RequireRole(RoleEnum.SUPER_ADMIN)
  async handlePermissionChange(
    @Body() body: PermissionChangeDto,
    @Req() req: AuthJwtRequest,
  ): Promise<{ success: boolean; message: string }> {
    if (req.user?.role !== RoleEnum.SUPER_ADMIN) {
      throw new UnauthorizedException(
        'Only super_admin can trigger permission changes',
      );
    }

    const { userId, timestamp } = body;

    if (!userId || typeof userId !== 'number') {
      throw new UnauthorizedException('userId must be a valid number');
    }

    if (!timestamp || typeof timestamp !== 'number') {
      throw new UnauthorizedException('timestamp must be a valid number');
    }

    const accessTokenTtl = parseInt(
      process.env.JWT_ACCESS_EXPIRATION || '3600',
      10,
    );

    await this.webhookService.addToPermissionBlacklist(
      userId,
      timestamp,
      accessTokenTtl,
    );

    return {
      success: true,
      message: `User ${userId} added to permission change blacklist for ${accessTokenTtl} seconds`,
    };
  }
}
