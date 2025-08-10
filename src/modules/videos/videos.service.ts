import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not, In, Brackets } from 'typeorm';
import { Video } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoResponseDto } from './dto/video-response.dto';
import * as fs from 'fs';
import * as path from 'path';
import { Response, Request } from 'express';
import { generateUniqueSlug } from '@/common/utils/slug-generator';
import { spawn } from 'child_process';
import { unlink } from 'fs/promises';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepo: Repository<Video>,
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

      ffmpeg.stderr.on('data', (data) => {
        console.log('📦 FFmpeg:', data.toString());
      });

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
    console.log(ids);
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
    const video = await this.findOne(id);

    if (dto.videoFilename && dto.videoFilename !== video.videoUrl) {
      const oldPath = path.join(
        process.cwd(),
        'uploads/videos',
        video.videoUrl,
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

    if (dto.thumbnailFilename && dto.thumbnailFilename !== video.thumbnailUrl) {
      const oldThumbPath = path.join(
        process.cwd(),
        'uploads/thumbnails',
        video.thumbnailUrl,
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
    await this.videoRepo.update(id, dto);

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.videoRepo.delete(id);
  }

  async getRelatedVideosWithPagination(slug: string, page = 1, limit = 10) {
    const mainVideo = await this.videoRepo.findOne({
      where: { slug },
    });

    if (!mainVideo) throw new NotFoundException('Video topilmadi');
    this.videoRepo.increment({ id: mainVideo.id }, 'views', 1).then();

    const allRelated = await this.videoRepo.find({
      where: {
        categoryId: mainVideo.categoryId, // 👈 category: { id: ... } emas!
        id: Not(mainVideo.id),
      },
    });

    const shuffled = allRelated.sort(() => Math.random() - 0.5);
    const totalRelated = allRelated.length;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedVideos = shuffled.slice(startIndex, endIndex);

    let data: VideoResponseDto[] = [];
    let total: number;
    let totalPages: number;

    if (page === 1) {
      data = [mainVideo, ...paginatedVideos].map(
        (v) => new VideoResponseDto(v),
      );
      total = totalRelated + 1;
      totalPages = Math.ceil(total / limit);
    } else {
      data = paginatedVideos.map((v) => new VideoResponseDto(v));
      total = totalRelated;
      totalPages = Math.ceil(total / limit);
    }

    return {
      page,
      limit,
      total,
      totalPages,
      data,
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
