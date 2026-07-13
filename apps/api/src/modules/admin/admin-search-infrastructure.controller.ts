import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from './admin-auth.guard';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminJwtPayload } from './admin-auth.guard';
import { AdminSearchInfrastructureService } from './admin-search-infrastructure.service';
import { assertCanViewSearchInfrastructure } from './role.util';

/**
 * Read-only search infrastructure status endpoint for admins.
 *
 * GET /api/v1/admin/search/infrastructure/status
 *   - requires admin auth (401 if missing, 403 if insufficient)
 *   - viewable by super_admin / editor / seo_manager / analyst
 *   - never returns secrets (no Meilisearch API key, no JWT secret, no passwordHash)
 *   - does not require Meilisearch to be available
 */
@Controller('admin/search')
export class AdminSearchInfrastructureController {
  constructor(private readonly service: AdminSearchInfrastructureService) {}

  @Get('infrastructure/status')
  @UseGuards(AdminAuthGuard)
  async status(@CurrentAdmin() admin: AdminJwtPayload) {
    assertCanViewSearchInfrastructure(admin.role);
    const data = await this.service.getStatus();
    return { success: true, data };
  }
}
