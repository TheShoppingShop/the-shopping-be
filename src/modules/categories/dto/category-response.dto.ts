import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../entities/category.entity';

export class CategoryResponseDto {
  @ApiProperty({ example: 'a2d1b037-5baf-4dcd-a204-e021f65ad801' })
  id: string;

  @ApiProperty({ example: 'Gadgets' })
  name: string;

  @ApiProperty({ example: 'gadgets' })
  slug: string;

  @ApiProperty({ example: 'http://localhost:3011/uploads/categories/1.jpg' })
  imgUrl?: string;

  @ApiProperty({ example: '2022-01-01T00:00:00.000Z' })
  createdAt?: Date;

  constructor(category: Category) {
    this.id = category.id;
    this.name = category.name;
    this.slug = category.slug;
    this.createdAt = category.createdAt;

    this.imgUrl = category.imgUrl
      ? `${process.env.APP_URL || 'http://localhost:3011'}${category.imgUrl}`
      : null;
  }
}
