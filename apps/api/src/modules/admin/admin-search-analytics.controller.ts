import { Controller, Get, Post, Query, UseGuards, Body } from '@nestjs/common';
import { AdminAuthGuard } from './admin-auth.guard';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminJwtPayload } from './admin-auth.guard';
import { AdminSearchAnalyticsService } from './admin-search-analytics.service';
import {
  assertCanViewSearchAnalytics,
  assertCanManageSearchTuning,
} from './role.util';
import {
  parseSearchAnalyticsQuery,
  parseSearchAnalyticsNoResult,
} from './admin-search-analytics-query.dto';

/**
 * Admin Search Analytics endpoints (Phase 6E).
 *
 * Routes (prefix `admin/search/analytics`):
 *   GET  overview          - aggregate stats + rule-based tuning suggestions
 *   GET  queries           - query-level analytics (paginated, filtered)
 *   GET  no-results        - zero-result query analytics (paginated, filtered)
 *   GET  provider-health   - live Meilisearch / database fallback snapshot
 *   POST tuning/apply-settings - conservative Meilisearch settings re-apply (super_admin)
 *
 * All routes require admin auth (401 if missing, 403 if insufficient role).
 * No route ever returns the Meilisearch API key, passwordHash, JWT_SECRET, or
 * a plaintext IP.
 */
@Controller('admin/search/analytics')
export class AdminSearchAnalyticsController {
  constructor(private readonly service: AdminSearchAnalyticsService) {}

  @Get('overview')
  @UseGuards(AdminAuthGuard)
  async overview(@CurrentAdmin() admin: AdminJwtPayload) {
    assertCanViewSearchAnalytics(admin.role);
    const data = await this.service.getOverview();
    return { success: true, data };
  }

  @Get('queries')
  @UseGuards(AdminAuthGuard)
  async queries(
    @Query() query: Record<string, string | undefined>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanViewSearchAnalytics(admin.role);
    const params = parseSearchAnalyticsQuery(query);
    const result = await this.service.listQueries(params);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get('no-results')
  @UseGuards(AdminAuthGuard)
  async noResults(
    @Query() query: Record<string, string | undefined>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanViewSearchAnalytics(admin.role);
    const params = parseSearchAnalyticsNoResult(query);
    const result = await this.service.listNoResults(params);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get('provider-health')
  @UseGuards(AdminAuthGuard)
  async providerHealth(@CurrentAdmin() admin: AdminJwtPayload) {
    assertCanViewSearchAnalytics(admin.role);
    const data = await this.service.getProviderHealth();
    return { success: true, data };
  }

  @Post('tuning/apply-settings')
  @UseGuards(AdminAuthGuard)
  async applyTuningSettings(
    @CurrentAdmin() admin: AdminJwtPayload,
    @Body() _body: Record<string, unknown>,
  ) {
    assertCanManageSearchTuning(admin.role);
    const data = await this.service.applyTuningSettings(admin.sub);
    return { success: true, data };
  }
}
