import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminAuthGuard, AdminJwtPayload } from './admin-auth.guard';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminEmojiService } from './admin-emoji.service';
import { assertCanViewEmoji } from './role.util';

@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly emojiService: AdminEmojiService) {}

  @Get()
  @UseGuards(AdminAuthGuard)
  async dashboard(@CurrentAdmin() admin: AdminJwtPayload) {
    assertCanViewEmoji(admin.role);
    const data = await this.emojiService.getDashboard(admin);
    return {
      success: true,
      data,
    };
  }
}
