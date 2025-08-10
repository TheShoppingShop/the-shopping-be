import { ApiProperty } from '@nestjs/swagger';
import { Video } from '../entities/video.entity';

export class VideoResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() slug: string;
  @ApiProperty() description?: string;
  @ApiProperty() videoUrl: string;
  @ApiProperty() likes?: number;
  @ApiProperty() views?: number;
  @ApiProperty() thumbnailUrl?: string;
  @ApiProperty() amazonLink?: string;
  @ApiProperty() metaTitle?: string;
  @ApiProperty() metaDescription?: string;
  @ApiProperty() videoCode?: number;
  @ApiProperty() metaKeywords?: string[];
  @ApiProperty({ type: [String] }) tags: string[];
  @ApiProperty() categoryId: string;
  @ApiProperty() isPublished: boolean;
  @ApiProperty() createdAt: Date;

  constructor(video: Video) {
    this.id = video.id;
    this.title = video.title;
    this.slug = video.slug;
    this.description = video.description;
    this.amazonLink = video.amazonLink;
    this.tags = video.tags;
    this.views = video.views;
    this.likes = video.likes;
    this.categoryId = video.categoryId;
    this.isPublished = video.isPublished;
    this.createdAt = video.createdAt;
    this.metaTitle = video.metaTitle;
    this.metaDescription = video.metaDescription;
    this.metaKeywords = video.metaKeywords;
    this.videoCode = video.videoCode;

    const BASE_URL = process.env.BASE_URL || 'http://localhost:3011';
    const baseName = video.videoFilename.replace('.mp4', '');

    this.videoUrl = `${BASE_URL}/videos/stream/${baseName}.m3u8`;
    this.thumbnailUrl = video.thumbnailFilename
      ? `${BASE_URL}/uploads/thumbnails/${video.thumbnailFilename}`
      : undefined;
  }
}
