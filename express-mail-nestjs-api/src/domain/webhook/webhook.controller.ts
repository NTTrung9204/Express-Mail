import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { WebhookService } from 'src/common/services/webhook.service';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { PermissionChangeDto } from 'src/common/dto/permission-change.dto';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('permission-change')
  @UseGuards(ApiKeyGuard)
  async handlePermissionChange(
    @Body() body: PermissionChangeDto,
  ): Promise<ApiResponseDto<null>> {
    const { userId, timestamp } = body;

    const accessTokenTtl = parseInt(
      process.env.JWT_ACCESS_EXPIRATION || '3600',
      10,
    );

    await this.webhookService.addToPermissionBlacklist(
      userId,
      timestamp,
      accessTokenTtl,
    );

    return new ApiResponseDto<null>(
      true,
      `User ${userId} added to permission change blacklist for ${accessTokenTtl} seconds`,
      null,
      undefined,
      200,
    );
  }
}
