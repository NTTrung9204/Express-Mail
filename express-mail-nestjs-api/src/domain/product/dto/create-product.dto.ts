import {
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Laptop Dell XPS 13' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Product quantity', example: 5 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Product weight in kg', example: 1.2 })
  @IsNumber()
  @Min(0.1)
  weight: number;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  img_url?: string;

  @ApiProperty({ description: 'Order ID', example: 1 })
  @IsInt()
  @Min(1)
  orderId: number;
}
