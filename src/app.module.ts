import { CategoriesModule } from './modules/categories/categories.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { VideosModule } from './modules/videos/videos.module';
import { SearchModule } from './modules/search/search.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { dataSourceOptions } from 'db/data-source';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    VideosModule,
    CategoriesModule,
    SearchModule,
    ReviewsModule,
    UsersModule,
    AuthModule,
    WishlistModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
