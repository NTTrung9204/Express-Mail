import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ description: 'Product ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Product name', example: 'Laptop Dell XPS 13' })
  name: string;

  @ApiProperty({ description: 'Product quantity', example: 5 })
  quantity: number;

  @ApiProperty({ description: 'Product weight in kg', example: 1.2 })
  weight: number;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/image.jpg',
  })
  img_url?: string;

  @ApiProperty({ description: 'Order ID', example: 1 })
  orderId?: number;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Soft delete date',
    example: '2024-01-01T00:00:00.000Z',
  })
  deletedAt?: Date;
}
