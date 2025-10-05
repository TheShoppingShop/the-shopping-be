import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In, Brackets } from 'typeorm';
import { Video } from './entities/video.entity';
import { Category } from '@/modules/categories/entities/category.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoResponseDto } from './dto/video-response.dto';
import * as fs from 'fs';
import * as path from 'path';
import { Response, Request } from 'express';
import { generateUniqueSlug } from '@/common/utils/slug-generator';
import { spawn } from 'child_process';
import { unlink } from 'fs/promises';
import { sync as globSync } from 'glob';
import { fileExists } from '@/utils/helper-functions';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepo: Repository<Video>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  private async convertToHLS(
    inputPath: string,
    outputDir: string,
    baseName: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '-i',
        inputPath,
        '-profile:v',
        'baseline',
        '-level',
        '3.0',
        '-start_number',
        '0',
        '-hls_time',
        '4',
        '-hls_list_size',
        '0',
        '-hls_segment_filename',
        `${outputDir}/${baseName}%03d.ts`,
        '-f',
        'hls',
        `${outputDir}/${baseName}.m3u8`,
      ];

      const ffmpeg = spawn('ffmpeg', args);

      ffmpeg.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg exited with code ${code}`));
      });
    });
  }

  async create(
    dto: CreateVideoDto & { videoFilename: string; thumbnailFilename?: string },
  ) {
    const slug = await generateUniqueSlug(dto.title, this.videoRepo);

    // videoCode avtomatik generatsiya qilinadi
    let videoCode = 10000;

    const lastVideoWithCode = await this.videoRepo
      .createQueryBuilder('video')
      .where('video.videoCode IS NOT NULL')
      .orderBy('video.videoCode', 'DESC')
      .getOne();

    if (lastVideoWithCode?.videoCode) {
      videoCode = lastVideoWithCode.videoCode + 1;
    }

    const categories = dto.categoryIds?.length
      ? await this.categoryRepo.findByIds(dto.categoryIds)
      : [];

    const inputPath = path.join(
      process.cwd(),
      'uploads/videos',
      dto.videoFilename,
    );
    const outputDir = path.join(process.cwd(), 'uploads/videos');
    const baseName = dto.videoFilename.replace(
      path.extname(dto.videoFilename),
      '',
    );

    await this.convertToHLS(inputPath, outputDir, baseName);

    const video = this.videoRepo.create({
      ...dto,
      slug,
      videoCode, // avtomatik qiymat
      categories,
    });

    return this.videoRepo.save(video);
  }

  async suggest(
    search: string,
    page = 1,
    limit = 10,
  ): Promise<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    data: VideoResponseDto[];
  }> {
    const qb = this.videoRepo.createQueryBuilder('video');

    const s = (search ?? '').trim();
    if (s) {
      qb.andWhere(
        new Brackets((q) => {
          q.where('video.title ILIKE :s').orWhere(`
           EXISTS (
             SELECT 1 FROM unnest(video.tags) AS tag
             WHERE tag ILIKE :s
           )
         `);
        }),
      ).setParameter('s', `%${s}%`);
    }

    const [videos, total] = await qb
      .orderBy('video.createdAt', 'DESC')
      .addOrderBy('video.id', 'DESC') // barqaror pagination uchun
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: videos.map((v) => new VideoResponseDto(v)),
    };
  }

  async findAll(page = 1, limit = 10, categoryId?: string, search?: string) {
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (search) where.title = ILike(`%${search}%`);

    const [videos, total] = await this.videoRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      data: videos.map((video) => new VideoResponseDto(video)),
    };
  }

  async findOne(id: string) {
    const video = await this.videoRepo.findOne({ where: { id } });
    if (!video) throw new NotFoundException('Video not found');
    return new VideoResponseDto(video);
  }

  async findByIds(ids: string[]) {
    const videos = await this.videoRepo.find({
      where: {
        id: In(ids),
      },
      order: { createdAt: 'DESC' },
    });

    return videos.map((video) => new VideoResponseDto(video));
  }

  async likeVideo(id: string) {
    const video = await this.videoRepo.findOneBy({ id });
    if (!video) throw new NotFoundException('Video topilmadi');

    await this.videoRepo.increment({ id }, 'likes', 1);
    return { success: true, likes: video.likes + 1 };
  }

  async unlikeVideo(id: string) {
    const video = await this.videoRepo.findOneBy({ id });
    if (!video) throw new NotFoundException('Video topilmadi');

    // likes soni 0 dan kam bo‘lib ketmasin
    const newLikes = video.likes > 0 ? video.likes - 1 : 0;

    await this.videoRepo.update({ id }, { likes: newLikes });
    return { success: true, likes: newLikes };
  }

  async findBySlug(slug: string) {
    const video = await this.videoRepo.findOne({ where: { slug } });
    if (!video) throw new NotFoundException('Video not found');
    await this.videoRepo.increment({ id: video.id }, 'views', 1);
    return new VideoResponseDto(video);
  }

  async update(
    id: string,
    dto: UpdateVideoDto & {
      videoFilename?: string;
      thumbnailFilename?: string;
    },
  ) {
    // 🔹 Entityni olamiz (DTO emas)
    const video = await this.videoRepo.findOne({
      where: { id },
      relations: ['categories'],
    });
    if (!video) throw new NotFoundException('Video not found');

    // 🔹 Fayl nomi o‘zgargan bo‘lsa, eski faylni o‘chir, yangisini konvertatsiya qil
    if (dto.videoFilename && dto.videoFilename !== video.videoFilename) {
      const oldPath = path.join(
        process.cwd(),
        'uploads/videos',
        video.videoFilename,
      );
      try {
        await unlink(oldPath);
      } catch (e) {
        console.warn(
          'Old video file not found or could not be deleted:',
          e.message,
        );
      }

      const inputPath = path.join(
        process.cwd(),
        'uploads/videos',
        dto.videoFilename,
      );
      const outputDir = path.join(process.cwd(), 'uploads/videos');
      const baseName = dto.videoFilename.replace(
        path.extname(dto.videoFilename),
        '',
      );
      await this.convertToHLS(inputPath, outputDir, baseName);
    }

    // 🔹 Thumbnail o‘zgargan bo‘lsa
    if (
      dto.thumbnailFilename &&
      dto.thumbnailFilename !== video.thumbnailFilename
    ) {
      const oldThumbPath = path.join(
        process.cwd(),
        'uploads/thumbnails',
        video.thumbnailFilename,
      );
      try {
        await unlink(oldThumbPath);
      } catch (e) {
        console.warn(
          'Old thumbnail not found or could not be deleted:',
          e.message,
        );
      }
    }

    // 🔹 categoryIds keldi — ORM uchun relationsni yangilaymiz
    if (dto.categoryIds && Array.isArray(dto.categoryIds)) {
      video.categories = await this.categoryRepo.findBy({
        id: In(dto.categoryIds),
      });
      delete dto.categoryIds; // ORM update()ga bormasin
    }

    // 🔹 Qolgan maydonlarni update qilamiz
    Object.assign(video, dto);
    await this.videoRepo.save(video);

    // 🔹 Yakuniy holatini DTO sifatida qaytaramiz
    return new VideoResponseDto(video);
  }

  // async update(
  //   id: string,
  //   dto: UpdateVideoDto & {
  //     videoFilename?: string;
  //     thumbnailFilename?: string;
  //   },
  // ) {
  //   const video = await this.findOne(id);
  //
  //   if (dto.videoFilename && dto.videoFilename !== video.videoUrl) {
  //     const oldPath = path.join(
  //       process.cwd(),
  //       'uploads/videos',
  //       video.videoUrl,
  //     );
  //     try {
  //       await unlink(oldPath);
  //     } catch (e) {
  //       console.warn(
  //         'Old video file not found or could not be deleted:',
  //         e.message,
  //       );
  //     }
  //
  //     const inputPath = path.join(
  //       process.cwd(),
  //       'uploads/videos',
  //       dto.videoFilename,
  //     );
  //     const outputDir = path.join(process.cwd(), 'uploads/videos');
  //     const baseName = dto.videoFilename.replace(
  //       path.extname(dto.videoFilename),
  //       '',
  //     );
  //
  //     await this.convertToHLS(inputPath, outputDir, baseName);
  //   }
  //
  //   if (dto.thumbnailFilename && dto.thumbnailFilename !== video.thumbnailUrl) {
  //     const oldThumbPath = path.join(
  //       process.cwd(),
  //       'uploads/thumbnails',
  //       video.thumbnailUrl,
  //     );
  //     try {
  //       await unlink(oldThumbPath);
  //     } catch (e) {
  //       console.warn(
  //         'Old thumbnail not found or could not be deleted:',
  //         e.message,
  //       );
  //     }
  //   }
  //
  //   if (dto.categoryIds) {
  //     const categoryIds = Array.isArray(dto.categoryIds)
  //       ? dto.categoryIds
  //       : [dto.categoryIds];
  //
  //     const categories = await this.categoryRepo.findBy({
  //       id: In(categoryIds),
  //     });
  //     video.categories = categories; // yangi bog‘lanishlar
  //   }
  //
  //   await this.videoRepo.update(id, dto);
  //
  //   return this.findOne(id);
  // }

  async remove(id: string) {
    const video = await this.findOne(id); // bu VideoResponseDto bo‘lishi mumkin

    // Fayl bazasi yo‘llari
    const videoDir = path.join(process.cwd(), 'uploads/videos');
    const thumbDir = path.join(process.cwd(), 'uploads/thumbnails');

    const onlyName = path.basename(video.videoFilename);
    // Videoning bazaviy nomi (video123.mp4 → video123)
    const baseName = onlyName.replace(path.extname(onlyName), '');

    try {
      // 🔹 .mp4 yoki .mov (video fayl)
      const originalPath = path.join(videoDir, video.videoFilename);
      if (originalPath && (await fileExists(originalPath))) {
        await fs.promises.unlink(originalPath);
      }

      // 🔹 .m3u8 fayl
      const m3u8Path = path.join(videoDir, `${baseName}.m3u8`);
      if (await fileExists(m3u8Path)) {
        await fs.promises.unlink(m3u8Path);
      }

      // 🔹 .ts segmentlar
      const tsFiles = globSync(path.join(videoDir, `${baseName}*.ts`));
      for (const file of tsFiles) {
        await fs.promises.unlink(file);
      }

      // 🔹 Thumbnail (agar mavjud bo‘lsa)
      if (video.thumbnailUrl) {
        const thumbPath = path.join(thumbDir, video.thumbnailFilename);
        if (await fileExists(thumbPath)) {
          await fs.promises.unlink(thumbPath);
        }
      }
    } catch (e) {
      console.warn('⚠️ Fayllarni o‘chirishda xatolik:', e.message);
    }

    // 🔚 Bazadan o‘chirish
    return this.videoRepo.delete(id);
  }

  // async getRelatedVideosWithPagination(slug: string, page = 1, limit = 10) {
  //   const mainVideo = await this.videoRepo.findOne({
  //     where: { slug },
  //   });
  //
  //   if (!mainVideo) throw new NotFoundException('Video topilmadi');
  //   this.videoRepo.increment({ id: mainVideo.id }, 'views', 1).then();
  //
  //   const allRelated = await this.videoRepo.find({
  //     where: {
  //       categoryId: mainVideo.categoryId,
  //       id: Not(mainVideo.id),
  //     },
  //   });
  //
  //   const shuffled = allRelated.sort(() => Math.random() - 0.5);
  //   const totalRelated = allRelated.length;
  //
  //   const startIndex = (page - 1) * limit;
  //   const endIndex = page * limit;
  //   const paginatedVideos = shuffled.slice(startIndex, endIndex);
  //
  //   let data: VideoResponseDto[] = [];
  //   let total: number;
  //   let totalPages: number;
  //
  //   if (page === 1) {
  //     data = [mainVideo, ...paginatedVideos].map(
  //       (v) => new VideoResponseDto(v),
  //     );
  //     total = totalRelated + 1;
  //     totalPages = Math.ceil(total / limit);
  //   } else {
  //     data = paginatedVideos.map((v) => new VideoResponseDto(v));
  //     total = totalRelated;
  //     totalPages = Math.ceil(total / limit);
  //   }
  //
  //   return {
  //     page,
  //     limit,
  //     total,
  //     totalPages,
  //     data,
  //   };
  // }
  async getRelatedVideosWithPagination(slug: string, page = 1, limit = 10) {
    const mainVideo = await this.videoRepo.findOne({
      where: { slug },
      relations: ['categories'],
    });

    if (!mainVideo) throw new NotFoundException('Video topilmadi');
    await this.videoRepo.increment({ id: mainVideo.id }, 'views', 1);

    const categoryIds = mainVideo.categories.map((cat) => cat.id);

    if (!categoryIds.length) {
      return {
        page,
        limit,
        total: 0,
        totalPages: 0,
        data: [],
      };
    }

    // 🔍 Related videolarni olib kelamiz
    const qb = this.videoRepo
      .createQueryBuilder('video')
      .leftJoin('video.categories', 'category')
      .where('category.id IN (:...categoryIds)', { categoryIds })
      .andWhere('video.slug != :slug', { slug })
      .orderBy('video.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [videos, total] = await qb.getManyAndCount();

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: [mainVideo, ...videos.map((v) => new VideoResponseDto(v))],
    };
  }

  streamVideo(filename: string, req: Request, res: Response) {
    const videoPath = path.join(process.cwd(), 'uploads/videos', filename);

    if (!fs.existsSync(videoPath)) {
      throw new NotFoundException('Fayl topilmadi');
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  }
}
