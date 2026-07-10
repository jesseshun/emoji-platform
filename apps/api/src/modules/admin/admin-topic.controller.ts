import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard, AdminJwtPayload } from './admin-auth.guard';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminTopicService } from './admin-topic.service';
import { assertCanViewTopic, assertCanManageTopic } from './role.util';
import { parseAdminTopicListQuery } from './dto/admin-topic-query.dto';
import {
  parseAdminTopicCreateBody,
  parseAdminTopicUpdateBody,
  parseTopicStatusUpdateBody,
  parseTopicEmojiBindBody,
} from './dto/admin-topic-body.dto';
import { isLocale } from '@emoji-platform/types';

@Controller('admin/topics')
export class AdminTopicController {
  constructor(private readonly topicService: AdminTopicService) {}

  @Get()
  @UseGuards(AdminAuthGuard)
  async list(
    @Query() query: Record<string, string | undefined>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanViewTopic(admin.role);
    const parsed = parseAdminTopicListQuery(query);
    const result = await this.topicService.list(parsed);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get('emoji-options')
  @UseGuards(AdminAuthGuard)
  async emojiOptions(
    @Query('locale') locale: string | undefined,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanViewTopic(admin.role);
    const safeLocale = locale && isLocale(locale) ? locale : 'zh';
    const result = await this.topicService.emojiOptions(safeLocale);
    return {
      success: true,
      data: result.data,
    };
  }

  @Get(':id')
  @UseGuards(AdminAuthGuard)
  async detail(@Param('id') id: string, @CurrentAdmin() admin: AdminJwtPayload) {
    assertCanViewTopic(admin.role);
    const result = await this.topicService.getById(id);
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
    assertCanManageTopic(admin.role);
    const input = parseAdminTopicCreateBody(body);
    const result = await this.topicService.create(input, admin);
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
    assertCanManageTopic(admin.role);
    const input = parseAdminTopicUpdateBody(body);
    const result = await this.topicService.update(id, input, admin);
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
    assertCanManageTopic(admin.role);
    const status = parseTopicStatusUpdateBody(body);
    const result = await this.topicService.setStatus(id, status, admin);
    return {
      success: true,
      data: result.data,
    };
  }

  @Put(':id/emojis')
  @UseGuards(AdminAuthGuard)
  async setEmojis(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanManageTopic(admin.role);
    const { items } = parseTopicEmojiBindBody(body);
    const result = await this.topicService.setEmojis(id, items, admin);
    return {
      success: true,
      data: result.data,
    };
  }
}
