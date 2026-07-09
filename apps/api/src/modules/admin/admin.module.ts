import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminAuthController } from './admin-auth.controller';
import { AdminController } from './admin.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminEmojiService } from './admin-emoji.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminEmojiController } from './admin-emoji.controller';
import { AdminCategoryController } from './admin-category.controller';

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
  ],
  providers: [AdminAuthService, AdminAuthGuard, AdminEmojiService],
  exports: [AdminAuthService],
})
export class AdminModule {}
