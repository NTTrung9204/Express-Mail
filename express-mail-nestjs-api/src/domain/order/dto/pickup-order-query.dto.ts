import { IsString, IsOptional, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PickupOrderQueryDto {
  @ApiProperty({
    description: 'Post office ID',
    example: 'po-123',
  })
  @IsString()
  postOfficeId: string;

  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'Start date (ISO format)',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (value && typeof value === 'string') {
      return new Date(value);
    }
    return value;
  })
  fromDate?: Date;

  @ApiProperty({
    description: 'End date (ISO format)',
    example: '2024-01-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (value && typeof value === 'string') {
      return new Date(value);
    }
    return value;
  })
  toDate?: Date;
}
