import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export enum PostOfficeOrderStatus {
  IN_WAREHOUSE = 'IN_WAREHOUSE',
  PICKUP_REQUESTED = 'PICKUP_REQUESTED',
  CLASSIFIED = 'CLASSIFIED',
  TRANSITING = 'TRANSITING',
}

export class PostOfficeOrdersQueryDto extends PaginationDto {
  @ApiPropertyOptional({ type: Number })
  @IsInt()
  @Type(() => Number)
  postOfficeId: number;

  @ApiPropertyOptional({
    enum: PostOfficeOrderStatus,
    isArray: true,
    description: 'Filter by specific statuses. Default: all statuses',
  })
  @IsOptional()
  @IsEnum(PostOfficeOrderStatus, { each: true })
  @IsArray()
  status?: PostOfficeOrderStatus[];
}
