import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
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

  @Column('text', { array: true, default: [] })
  tags: string[];

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: string;

  @Column({ default: true })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
