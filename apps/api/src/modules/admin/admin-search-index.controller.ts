import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from './admin-auth.guard';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminJwtPayload } from './admin-auth.guard';
import { AdminSearchIndexService } from './admin-search-index.service';
import {
  assertCanViewSearchInfrastructure,
  assertCanManageSearchIndex,
  assertCanManageSearchSettings,
} from './role.util';
import {
  SearchIndexStatus,
  SearchIndexRebuildResult,
  SearchIndexSettingsResult,
} from '../search/search.types';

/**
 * Admin search index management endpoints (Phase 6B).
 *
 * Routes (prefix `admin/search`):
 *   GET  index/status    - read-only index health (super_admin/editor/seo_manager/analyst)
 *   POST index/rebuild   - rebuild the index (super_admin/editor)
 *   POST index/settings  - apply index settings/schema (super_admin)
 *
 * All routes require admin auth (401 if missing, 403 if insufficient role).
 * None of them ever return the Meilisearch API key.
 */
@Controller('admin/search')
export class AdminSearchIndexController {
  constructor(private readonly service: AdminSearchIndexService) {}

  @Get('index/status')
  @UseGuards(AdminAuthGuard)
  async indexStatus(
    @CurrentAdmin() admin: AdminJwtPayload,
  ): Promise<{ success: true; data: SearchIndexStatus }> {
    assertCanViewSearchInfrastructure(admin.role);
    const data = await this.service.getIndexStatus();
    return { success: true, data };
  }

  @Post('index/rebuild')
  @UseGuards(AdminAuthGuard)
  async rebuild(
    @CurrentAdmin() admin: AdminJwtPayload,
    @Body() body: Record<string, unknown>,
  ): Promise<{ success: true; data: SearchIndexRebuildResult }> {
    assertCanManageSearchIndex(admin.role);
    const entityType = this.service.parseEntityType(body?.entityType);
    const data = await this.service.rebuild(entityType, admin.sub);
    return { success: true, data };
  }

  @Post('index/settings')
  @UseGuards(AdminAuthGuard)
  async applySettings(
    @CurrentAdmin() admin: AdminJwtPayload,
  ): Promise<{ success: true; data: SearchIndexSettingsResult }> {
    assertCanManageSearchSettings(admin.role);
    const data = await this.service.applySettings(admin.sub);
    return { success: true, data };
  }
}
