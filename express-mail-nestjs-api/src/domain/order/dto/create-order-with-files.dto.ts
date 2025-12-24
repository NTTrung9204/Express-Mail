import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderWithFilesDto {
  @ApiProperty({ description: 'Receiver phone number', example: '0123456789' })
  receiver_phone: string;

  @ApiProperty({
    description: 'Receiver province/city',
    example: 'Ho Chi Minh City',
  })
  receiver_province_city: string;

  @ApiProperty({ description: 'Receiver ward/commune', example: 'District 1' })
  receiver_ward_commune: string;

  @ApiProperty({ description: 'Receiver address', example: '123 Main Street' })
  receiver_address: string;

  @ApiProperty({
    description: 'Receiver coordinates',
    example: '10.762622,106.660172',
  })
  receiver_coordinate: string;

  @ApiProperty({ description: 'Receiver district', example: 'District 1' })
  receiver_district: string;

  @ApiProperty({ description: 'Receiver name', example: 'John Doe' })
  receiver_name: string;

  @ApiProperty({ description: 'Package length in cm', example: 30 })
  length: number;

  @ApiProperty({ description: 'Package width in cm', example: 20 })
  width: number;

  @ApiProperty({ description: 'Package height in cm', example: 10 })
  height: number;

  @ApiProperty({ description: 'Package weight in kg', example: 1.5 })
  weight: number;

  @ApiProperty({ description: 'Cash on delivery amount', example: 500000 })
  cod: number;

  @ApiProperty({
    description: 'Indicates whether the receiver pays for shipping',
    example: true,
  })
  is_receiver_pay_shipping: boolean;

  @ApiPropertyOptional({
    description: 'Status of the order',
    example: 'PENDING',
    enum: ['PENDING', 'CANCELED', 'COMPLETED'],
  })
  order_status?: string;

  @ApiProperty({
    description: 'List of products in the order',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Laptop Dell XPS 13' },
        quantity: { type: 'number', example: 5 },
        weight: { type: 'number', example: 1.2 },
      },
    },
  })
  products: string;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description:
      'Product images (up to 100 files). Files will be matched to products by order: file[0] → product[0], file[1] → product[1], etc. Supported formats: JPEG, PNG, WebP. Max 5MB per file.',
  })
  product_images?: any[];
}
