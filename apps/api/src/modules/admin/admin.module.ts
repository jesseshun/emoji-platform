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
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminEmojiController } from './admin-emoji.controller';
import { AdminCategoryController } from './admin-category.controller';
import { AdminTopicController } from './admin-topic.controller';
import { AdminArticleController } from './admin-article.controller';
import { AdminAssetController } from './admin-asset.controller';
import { AdminSeoController } from './admin-seo.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'change_me',
        // jsonwebtoken's expiresIn accepts a time-string (e.g. "7d"); the
        // branded StringValue type is not exported, so we assert here.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '7d') as any,
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
  ],
  providers: [AdminAuthService, AdminAuthGuard, AdminEmojiService, AdminCategoryService, AdminTopicService, AdminArticleService, AdminAssetService, AdminSeoService],
  exports: [AdminAuthService],
})
export class AdminModule {}
