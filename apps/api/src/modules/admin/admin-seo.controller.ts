import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard, AdminJwtPayload } from './admin-auth.guard';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminSeoService } from './admin-seo.service';
import { assertCanViewSeo, assertCanManageSeo } from './role.util';
import {
  parseAdminSeoListQuery,
  parseSeoEntityType,
  SeoEntityType,
} from './dto/admin-seo-query.dto';
import { parseSeoUpdateBody } from './dto/admin-seo-body.dto';

@Controller('admin/seo')
export class AdminSeoController {
  constructor(private readonly seoService: AdminSeoService) {}

  @Get('overview')
  @UseGuards(AdminAuthGuard)
  async overview(@CurrentAdmin() admin: AdminJwtPayload) {
    assertCanViewSeo(admin.role);
    const data = await this.seoService.overview();
    return { success: true, data };
  }

  @Get('entities')
  @UseGuards(AdminAuthGuard)
  async list(
    @Query() query: Record<string, string | undefined>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanViewSeo(admin.role);
    const parsed = parseAdminSeoListQuery(query);
    const result = await this.seoService.listEntities(parsed);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get('entities/:entityType/:id')
  @UseGuards(AdminAuthGuard)
  async detail(
    @Param('entityType') entityType: string,
    @Param('id') id: string,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanViewSeo(admin.role);
    const type = parseSeoEntityType(entityType);
    const result = await this.seoService.getEntity(type, id);
    return { success: true, data: result };
  }

  @Patch('entities/:entityType/:id')
  @UseGuards(AdminAuthGuard)
  async update(
    @Param('entityType') entityType: string,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanManageSeo(admin.role);
    const type: SeoEntityType = parseSeoEntityType(entityType);
    const input = parseSeoUpdateBody(body);
    const result = await this.seoService.updateEntity(type, id, input, admin);
    return { success: true, data: result.data };
  }

  @Get('robots-status')
  @UseGuards(AdminAuthGuard)
  async robotsStatus(@CurrentAdmin() admin: AdminJwtPayload) {
    assertCanViewSeo(admin.role);
    return { success: true, data: await this.seoService.robotsStatus() };
  }

  @Get('sitemap-status')
  @UseGuards(AdminAuthGuard)
  async sitemapStatus(@CurrentAdmin() admin: AdminJwtPayload) {
    assertCanViewSeo(admin.role);
    return { success: true, data: await this.seoService.sitemapStatus() };
  }
}
