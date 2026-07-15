import { Module, Logger } from '@nestjs/common';
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
import { AdminSearchIndexController } from './admin-search-index.controller';
import { AdminSearchIndexService } from './admin-search-index.service';
import { AdminSearchAnalyticsController } from './admin-search-analytics.controller';
import { AdminSearchAnalyticsService } from './admin-search-analytics.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [
    SearchModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        const nodeEnv = config.get<string>('NODE_ENV');
        const appEnv = config.get<string>('APP_ENV');
        const isProdLike = nodeEnv === 'production' || appEnv === 'preview';
        const expiresIn = (config.get<string>('JWT_EXPIRES_IN') || '7d') as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        // 不允许在 production / preview 使用弱默认 JWT_SECRET。
        // 缺失时：production/preview 直接启动失败（fail-fast）；本地开发使用告警占位值，避免误用于预览/生产。
        if (!secret || secret.length === 0) {
          if (isProdLike) {
            throw new Error(
              'FATAL: JWT_SECRET is not configured. Refusing to start in production/preview. ' +
                'Set a strong random JWT_SECRET (e.g. `openssl rand -base64 32`).',
            );
          }
          new Logger('JwtModule').warn(
            'JWT_SECRET is not set; using an INSECURE development placeholder. ' +
              'DO NOT use this configuration in preview or production.',
          );
          return {
            secret: 'dev_insecure_jwt_secret_change_me_do_not_ship',
            signOptions: { expiresIn },
          };
        }

        return { secret, signOptions: { expiresIn } };
      },
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
    AdminSearchIndexController,
    AdminSearchAnalyticsController,
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
    AdminSearchIndexService,
    AdminSearchAnalyticsService,
  ],
  exports: [AdminAuthService],
})
export class AdminModule {}
