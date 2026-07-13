import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminSearchInfrastructureService } from './admin-search-infrastructure.service';

/**
 * Read-only search infrastructure status endpoint for admins.
 *
 * GET /api/v1/admin/search/infrastructure/status
 *   - requires admin auth (401 if missing, 403 if insufficient)
 *   - never returns secrets (no Meilisearch API key, no JWT secret, no passwordHash)
 *   - does not require Meilisearch to be available
 */
@Controller('admin/search')
export class AdminSearchInfrastructureController {
  constructor(private readonly service: AdminSearchInfrastructureService) {}

  @Get('infrastructure/status')
  @UseGuards(AdminAuthGuard)
  async status() {
    const data = this.service.getStatus();
    return { success: true, data };
  }
}
