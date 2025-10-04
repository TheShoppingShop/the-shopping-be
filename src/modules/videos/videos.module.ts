import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { Video } from './entities/video.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '@/modules/categories/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Video, Category])],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
