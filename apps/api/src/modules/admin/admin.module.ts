import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminAuthController } from './admin-auth.controller';
import { AdminController } from './admin.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminEmojiService } from './admin-emoji.service';
import { AdminCategoryService } from './admin-category.service';
import { AdminTopicService } from './admin-topic.service';
import { AdminArticleService } from './admin-article.service';
import { AdminAssetService } from './admin-asset.service';
import { AdminSeoService } from './admin-seo.service';
import { AdminSeoQualityService } from './admin-seo-quality.service';
import { AdminSeoQualityController } from './admin-seo-quality.controller';
import { AdminLogsService } from './admin-logs.service';
import { AdminReviewService } from './admin-review.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminEmojiController } from './admin-emoji.controller';
import { AdminCategoryController } from './admin-category.controller';
import { AdminTopicController } from './admin-topic.controller';
import { AdminArticleController } from './admin-article.controller';
import { AdminAssetController } from './admin-asset.controller';
import { AdminSeoController } from './admin-seo.controller';
import { AdminSearchLogsController, AdminCopyEventsController } from './admin-logs.controller';
import { AdminReviewController } from './admin-review.controller';
import { AdminSearchInfrastructureController } from './admin-search-infrastructure.controller';
import { AdminSearchInfrastructureService } from './admin-search-infrastructure.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [
    SearchModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'change_me',
        // jsonwebtoken's expiresIn accepts a time-string (e.g. "7d"); the
        // branded StringValue type is not exported, so we assert here.
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '7d') as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        },
      }),
    }),
  ],
  controllers: [
    AdminAuthController,
    AdminController,
    AdminDashboardController,
    AdminEmojiController,
    AdminCategoryController,
    AdminTopicController,
    AdminArticleController,
    AdminAssetController,
    AdminSeoController,
    AdminSeoQualityController,
    AdminSearchLogsController,
    AdminCopyEventsController,
    AdminReviewController,
    AdminSearchInfrastructureController,
  ],
  providers: [
    AdminAuthService,
    AdminAuthGuard,
    AdminEmojiService,
    AdminCategoryService,
    AdminTopicService,
    AdminArticleService,
    AdminAssetService,
    AdminSeoService,
    AdminSeoQualityService,
    AdminLogsService,
    AdminReviewService,
    AdminSearchInfrastructureService,
  ],
  exports: [AdminAuthService],
})
export class AdminModule {}
