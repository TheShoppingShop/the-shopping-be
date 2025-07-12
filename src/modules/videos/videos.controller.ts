import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  Get,
  Query,
  Param,
  Res,
  Req,
  Put,
  Delete,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response, Request } from 'express';
import { VideoResponseDto } from './dto/video-response.dto';

@ApiTags('Videos')
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Video va thumbnail yuklash (file + metadata)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        slug: { type: 'string' },
        description: { type: 'string' },
        categoryId: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        amazonLink: { type: 'string' },
        video: { type: 'string', format: 'binary' },
        thumbnail: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const folder =
              file.fieldname === 'video'
                ? './uploads/videos'
                : './uploads/thumbnails';
            cb(null, folder);
          },
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
          },
        }),
      },
    ),
  )
  async uploadVideo(
    @UploadedFiles()
    files: { video?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] },
    @Body() dto: CreateVideoDto,
  ) {
    const videoFile = files.video?.[0];
    const thumbnailFile = files.thumbnail?.[0];
    return this.videosService.create({
      ...dto,
      videoFilename: videoFile?.filename,
      thumbnailFilename: thumbnailFile?.filename,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Videolar ro‘yxati (filter + pagination)' })
  @ApiResponse({ status: 200, type: [VideoResponseDto] })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.videosService.findAll(+page, +limit, categoryId, search);
  }

  // @Get(':id')
  // @ApiOperation({ summary: 'ID bo‘yicha bitta video' })
  // @ApiResponse({ status: 200, type: VideoResponseDto })
  // findOne(@Param('id') id: string) {
  //   return this.videosService.findOne(id);
  // }

  @Get(':slug')
  @ApiOperation({ summary: 'ID bo‘yicha bitta video' })
  @ApiResponse({ status: 200, type: VideoResponseDto })
  findBySlug(@Param('slug') slug: string) {
    return this.videosService.findBySlug(slug);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Videoni yangilash (fayl + metadata)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        slug: { type: 'string' },
        description: { type: 'string' },
        categoryId: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        amazonLink: { type: 'string' },
        video: { type: 'string', format: 'binary' },
        thumbnail: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const folder =
              file.fieldname === 'video'
                ? './uploads/videos'
                : './uploads/thumbnails';
            cb(null, folder);
          },
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
          },
        }),
      },
    ),
  )
  async updateVideo(
    @Param('id') id: string,
    @UploadedFiles()
    files: { video?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] },
    @Body() dto: UpdateVideoDto,
  ) {
    const videoFile = files.video?.[0];
    const thumbnailFile = files.thumbnail?.[0];
    return this.videosService.update(id, {
      ...dto,
      videoFilename: videoFile?.filename,
      thumbnailFilename: thumbnailFile?.filename,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Videoni o‘chirish' })
  remove(@Param('id') id: string) {
    return this.videosService.remove(id);
  }

  @Get('related/:slug')
  @ApiOperation({
    summary:
      'Slug orqali video va shu kategoriyadagi videolarni olish (pagination bilan)',
  })
  @ApiResponse({ status: 200 })
  getRelatedVideosWithPagination(
    @Param('slug') slug: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.videosService.getRelatedVideosWithPagination(
      slug,
      +page,
      +limit,
    );
  }

  @Get('stream/:filename')
  @ApiOperation({ summary: 'Videoni stream qilish' })
  streamVideo(
    @Param('filename') filename: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.videosService.streamVideo(filename, req, res);
  }
}
