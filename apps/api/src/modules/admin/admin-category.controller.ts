import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminAuthGuard, AdminJwtPayload } from './admin-auth.guard';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminEmojiService } from './admin-emoji.service';
import { assertCanViewEmoji } from './role.util';
import { isLocale } from '@emoji-platform/types';

@Controller('admin/categories')
export class AdminCategoryController {
  constructor(private readonly emojiService: AdminEmojiService) {}

  @Get('options')
  @UseGuards(AdminAuthGuard)
  async options(
    @Query('locale') locale: string | undefined,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanViewEmoji(admin.role);
    const safeLocale = locale && isLocale(locale) ? locale : 'zh';
    const result = await this.emojiService.categoryOptions(safeLocale);
    return {
      success: true,
      data: result.data,
    };
  }
}
