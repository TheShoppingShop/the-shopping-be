import { ApiProperty } from '@nestjs/swagger';
import { Video } from '../entities/video.entity';

export class VideoResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() slug: string;
  @ApiProperty() description?: string;
  @ApiProperty() videoUrl: string;
  @ApiProperty() thumbnailUrl?: string;
  @ApiProperty() amazonLink?: string;
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
    this.categoryId = video.categoryId;
    this.isPublished = video.isPublished;
    this.createdAt = video.createdAt;

    const BASE_URL = process.env.BASE_URL || 'http://localhost:3011';
    const baseName = video.videoFilename.replace('.mp4', '');

    this.videoUrl = `${BASE_URL}/videos/stream/${baseName}.m3u8`;
    this.thumbnailUrl = video.thumbnailFilename
      ? `${BASE_URL}/uploads/thumbnails/${video.thumbnailFilename}`
      : undefined;
  }
}
