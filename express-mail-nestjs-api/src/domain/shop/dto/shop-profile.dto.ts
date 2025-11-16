import { ApiProperty } from '@nestjs/swagger';

export class ShopProfileDto {
  @ApiProperty({ description: 'Profile ID', example: 13 })
  id: number;

  @ApiProperty({ description: 'User ID', example: 57 })
  user: number;

  @ApiProperty({ description: 'Shop address', example: 'Da Nang' })
  address: string;

  @ApiProperty({ description: 'Shop phone number', example: '0123456789' })
  phoneNumber: string;

  @ApiProperty({ description: 'Shop latitude', example: '16.073684' })
  latitude: string;

  @ApiProperty({ description: 'Shop longitude', example: '108.149841' })
  longitude: string;

  @ApiProperty({ description: 'Post office ID', example: 1 })
  postOffice: number;
}
