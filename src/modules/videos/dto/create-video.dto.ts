import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateVideoDto {
  @ApiProperty() @IsString() @IsNotEmpty() title: string;
  @ApiProperty() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsOptional() @IsString() amazonLink?: string;
  @ApiProperty({ type: [String] }) @IsOptional() @IsArray() tags?: string[];
  @ApiProperty() @IsString() @IsNotEmpty() categoryId: string;
}
