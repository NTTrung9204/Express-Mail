import { ApiProperty } from '@nestjs/swagger';

export class ShopProfileDto {
  @ApiProperty({ description: 'User ID', example: 56 })
  id: number;

  @ApiProperty({ description: 'Username', example: 'Trung' })
  username: string;

  @ApiProperty({ description: 'Email', example: 'Trung@example.com' })
  email: string;

  @ApiProperty({ description: 'First name', example: 'Trung' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Nguyen' })
  lastName: string;

  @ApiProperty({ description: 'User role', example: 'shop' })
  role: string;

  @ApiProperty({ description: 'Exclude permissions', example: [] })
  excludePermissions: string[];

  @ApiProperty({ description: 'Profile ID', example: 13 })
  profileId?: number;

  @ApiProperty({ description: 'Shop address', example: 'Da Nang' })
  address?: string;

  @ApiProperty({ description: 'Shop phone number', example: '0123456789' })
  phoneNumber?: string;

  @ApiProperty({ description: 'Shop latitude', example: '16.073684' })
  latitude?: string;

  @ApiProperty({ description: 'Shop longitude', example: '108.149841' })
  longitude?: string;

  @ApiProperty({ description: 'Post office ID', example: 1 })
  postOffice?: number;
}
