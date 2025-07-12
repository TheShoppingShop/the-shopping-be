import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Video } from '@/modules/videos/entities/video.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Video, { eager: true })
  @JoinColumn({ name: 'videoId' })
  video: Video;

  @Column('text')
  summary: string;

  @CreateDateColumn()
  createdAt: Date;
}
