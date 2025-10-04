import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { CategoryResponseDto } from '@/modules/categories/dto/category-response.dto';
import { generateUniqueSlug } from '@/common/utils/slug-generator';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto, imgUrl?: string) {
    const slug = await generateUniqueSlug(dto.name, this.categoryRepo);

    imgUrl = `/uploads/categories/${imgUrl}`;

    const category = this.categoryRepo.create({
      ...dto,
      slug,
      imgUrl,
    });

    return this.categoryRepo.save(category);
  }

  async findAll() {
    const categories = await this.categoryRepo.find({ order: { name: 'ASC' } });
    return categories.map((category) => new CategoryResponseDto(category));
  }

  async findOne(id: string) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Kategoriya topilmadi');
    return new CategoryResponseDto(category);
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    image?: Express.Multer.File,
  ): Promise<UpdateCategoryDto> {
    const category = await this.findOne(id);

    if (image) {
      if (category.imgUrl) {
        const filePath = join(__dirname, '../../../..', category.imgUrl);
        try {
          await unlink(filePath);
        } catch (err) {
          console.warn(
            'Old image file not found or could not be deleted:',
            err.message,
          );
        }
      }

      dto.imgUrl = `/uploads/categories/${image.filename}`;
    }

    await this.categoryRepo.update(id, dto);

    return this.findOne(id);
  }
  async remove(id: string) {
    await this.findOne(id);
    return this.categoryRepo.delete(id);
  }
}
