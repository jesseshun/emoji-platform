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
import { AdminArticleService } from './admin-article.service';
import { assertCanViewArticle, assertCanManageArticle } from './role.util';
import { parseAdminArticleListQuery } from './dto/admin-article-query.dto';
import {
  parseAdminArticleCreateBody,
  parseAdminArticleUpdateBody,
  parseArticleStatusUpdateBody,
} from './dto/admin-article-body.dto';

@Controller('admin/articles')
export class AdminArticleController {
  constructor(private readonly articleService: AdminArticleService) {}

  @Get()
  @UseGuards(AdminAuthGuard)
  async list(
    @Query() query: Record<string, string | undefined>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanViewArticle(admin.role);
    const parsed = parseAdminArticleListQuery(query);
    const result = await this.articleService.list(parsed);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  @UseGuards(AdminAuthGuard)
  async detail(@Param('id') id: string, @CurrentAdmin() admin: AdminJwtPayload) {
    assertCanViewArticle(admin.role);
    const result = await this.articleService.getById(id);
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
    assertCanManageArticle(admin.role);
    const input = parseAdminArticleCreateBody(body);
    const result = await this.articleService.create(input, admin);
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
    assertCanManageArticle(admin.role);
    const input = parseAdminArticleUpdateBody(body);
    const result = await this.articleService.update(id, input, admin);
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
    assertCanManageArticle(admin.role);
    const status = parseArticleStatusUpdateBody(body);
    const result = await this.articleService.setStatus(id, status, admin);
    return {
      success: true,
      data: result.data,
    };
  }
}
