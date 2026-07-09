import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard, AdminJwtPayload } from './admin-auth.guard';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminEmojiService } from './admin-emoji.service';
import { assertCanViewEmoji, assertCanManageEmoji } from './role.util';
import { parseAdminEmojiListQuery } from './dto/admin-emoji-query.dto';
import {
  parseAdminEmojiCreateBody,
  parseAdminEmojiUpdateBody,
  parseEmojiStatusUpdateBody,
} from './dto/admin-emoji-body.dto';

@Controller('admin/emojis')
export class AdminEmojiController {
  constructor(private readonly emojiService: AdminEmojiService) {}

  @Get()
  @UseGuards(AdminAuthGuard)
  async list(
    @Query() query: Record<string, string | undefined>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanViewEmoji(admin.role);
    const parsed = parseAdminEmojiListQuery(query);
    const result = await this.emojiService.list(parsed);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  @UseGuards(AdminAuthGuard)
  async detail(@Param('id') id: string, @CurrentAdmin() admin: AdminJwtPayload) {
    assertCanViewEmoji(admin.role);
    const result = await this.emojiService.getById(id);
    return {
      success: true,
      data: result.data,
    };
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  async create(
    @Body() body: Record<string, unknown>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanManageEmoji(admin.role);
    const input = parseAdminEmojiCreateBody(body);
    const result = await this.emojiService.create(input, admin);
    return {
      success: true,
      data: result.data,
    };
  }

  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanManageEmoji(admin.role);
    const input = parseAdminEmojiUpdateBody(body);
    const result = await this.emojiService.update(id, input, admin);
    return {
      success: true,
      data: result.data,
    };
  }

  @Patch(':id/status')
  @UseGuards(AdminAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanManageEmoji(admin.role);
    const status = parseEmojiStatusUpdateBody(body);
    const result = await this.emojiService.setStatus(id, status, admin);
    return {
      success: true,
      data: result.data,
    };
  }
}
