import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { Category } from '@/modules/categories/entities/category.entity';

@Entity()
export class Video {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  videoFilename: string;

  @Column({ nullable: true })
  thumbnailFilename: string;

  @Column({ nullable: true })
  amazonLink: string;

  @Column({ default: 0 })
  views: number;

  @Column({ nullable: true })
  metaTitle?: string;

  @Column({ nullable: true })
  metaDescription?: string;

  @Column('text', { nullable: true })
  metaKeywords?: string;

  @Column({ default: 0 })
  likes: number;

  @Column({ unique: true, nullable: true })
  videoCode: number;

  @Column('text', { array: true, default: [] })
  tags: string[];

  @ManyToMany(() => Category, { eager: true })
  @JoinTable({
    name: 'video_categories',
    joinColumn: {
      name: 'videoId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'categoryId',
      referencedColumnName: 'id',
    },
  })
  categories: Category[];

  @Column({ default: true })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
