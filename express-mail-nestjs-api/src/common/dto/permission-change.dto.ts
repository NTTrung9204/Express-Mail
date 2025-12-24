import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class PermissionChangeDto {
  @IsNotEmpty({ message: 'userId is required' })
  @IsNumber({}, { message: 'userId must be a number' })
  @IsPositive({ message: 'userId must be a positive number' })
  @Type(() => Number)
  userId: number;

  @IsNotEmpty({ message: 'timestamp is required' })
  @IsNumber({}, { message: 'timestamp must be a number' })
  @IsPositive({ message: 'timestamp must be a positive number' })
  @Type(() => Number)
  timestamp: number;
}
