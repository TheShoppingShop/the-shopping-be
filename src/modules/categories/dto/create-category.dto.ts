import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Gadgets', description: 'Kategoriya nomi' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Kategoriya rasmi (fayl)',
  })
  imgUrl?: any;
}
