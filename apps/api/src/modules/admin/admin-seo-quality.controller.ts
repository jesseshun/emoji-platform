import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard, AdminJwtPayload } from './admin-auth.guard';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminSeoQualityService } from './admin-seo-quality.service';
import { parseSeoQualityIssuesQuery } from './dto/admin-seo-quality-query.dto';
import { parseSeoEntityType } from './dto/admin-seo-query.dto';

@Controller('admin/seo')
export class AdminSeoQualityController {
  constructor(private readonly qualityService: AdminSeoQualityService) {}

  @Get('quality/overview')
  @UseGuards(AdminAuthGuard)
  async overview(@CurrentAdmin() admin: AdminJwtPayload) {
    this.qualityService.assertView(admin);
    const data = await this.qualityService.getOverview();
    return { success: true, data };
  }

  @Get('quality/issues')
  @UseGuards(AdminAuthGuard)
  async issues(
    @Query() query: Record<string, string | undefined>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    this.qualityService.assertView(admin);
    const parsed = parseSeoQualityIssuesQuery(query);
    const result = await this.qualityService.listIssues(parsed);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
      issuesByType: result.issuesByType,
    };
  }

  @Post('quality/run')
  @UseGuards(AdminAuthGuard)
  async run(@CurrentAdmin() admin: AdminJwtPayload) {
    // Only roles allowed to run an on-demand check may call this.
    this.qualityService.assertRun(admin);
    // Read-only: never writes to the database or modifies entity data.
    const data = await this.qualityService.runCheck();
    return { success: true, data, runAt: new Date().toISOString() };
  }

  @Get('internal-links/suggestions')
  @UseGuards(AdminAuthGuard)
  async suggestions(
    @Query('entityType') entityType: string,
    @Query('id') id: string,
    @Query('locale') locale: string,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    this.qualityService.assertView(admin);
    const type = parseSeoEntityType(entityType);
    if (!id || typeof id !== 'string') {
      return { success: false, error: { code: 'BAD_REQUEST', message: '缺少 id 参数' } };
    }
    const loc: 'zh' | 'en' = locale === 'en' ? 'en' : 'zh';
    const data = await this.qualityService.getInternalLinkSuggestions(type, id, loc);
    return { success: true, data };
  }
}
