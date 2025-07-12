import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@/modules/users/entities/user.entity';

export class RegisterUserDto {
  @ApiProperty() @IsEmail() email: string;

  @ApiProperty() @IsString() @MinLength(6) password: string;

  @ApiProperty({ enum: UserRole, required: false, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
