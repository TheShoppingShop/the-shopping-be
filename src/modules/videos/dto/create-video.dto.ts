import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateVideoDto {
  @ApiProperty() @IsString() @IsNotEmpty() title: string;
  @ApiProperty() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsOptional() @IsString() amazonLink?: string;
  @ApiProperty() @IsOptional() views?: number;
  @ApiProperty() @IsOptional() likes?: number;
  @ApiProperty() @IsOptional() metaTitle?: string;
  @ApiProperty() @IsOptional() metaDescription?: string;
  @ApiProperty() @IsOptional() metaKeywords?: string;
  @ApiProperty() @IsOptional() videoCode?: number;
  @ApiProperty({ type: [String] }) @IsOptional() @IsArray() tags?: string[];
  @ApiProperty() @IsString() @IsNotEmpty() categoryId: string;
}
