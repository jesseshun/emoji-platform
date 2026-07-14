import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmojisModule } from './modules/emojis/emojis.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TopicsModule } from './modules/topics/topics.module';
import { SearchModule } from './modules/search/search.module';
import { DiscoveryModule } from './modules/discovery/discovery.module';
import { RecommendationModule } from './modules/recommendations/recommendations.module';
import { EventsModule } from './modules/events/events.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { SitemapModule } from './modules/sitemap/sitemap.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    PrismaModule,
    HealthModule,
    EmojisModule,
    CategoriesModule,
    TopicsModule,
    SearchModule,
    DiscoveryModule,
    RecommendationModule,
    EventsModule,
    ArticlesModule,
    SitemapModule,
    AdminModule,
  ],
})
export class AppModule {}
