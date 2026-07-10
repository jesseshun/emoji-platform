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
import { AdminReviewService } from './admin-review.service';
import { assertCanViewLogs, assertCanManageReview } from './role.util';
import { parseReviewQuery } from './dto/admin-review-query.dto';

@Controller('admin/reviews')
export class AdminReviewController {
  constructor(private readonly reviewService: AdminReviewService) {}

  @Get()
  @UseGuards(AdminAuthGuard)
  async list(
    @Query() query: Record<string, string | undefined>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanViewLogs(admin.role);
    const parsed = parseReviewQuery(query);
    const result = await this.reviewService.listReviews(parsed);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get(':id')
  @UseGuards(AdminAuthGuard)
  async detail(@Param('id') id: string, @CurrentAdmin() admin: AdminJwtPayload) {
    assertCanViewLogs(admin.role);
    const data = await this.reviewService.getReview(id);
    return { success: true, data };
  }

  @Patch(':id/status')
  @UseGuards(AdminAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanManageReview(admin.role);
    const status = typeof body.status === 'string' ? body.status : undefined;
    const adminNote = typeof body.adminNote === 'string' ? body.adminNote : undefined;
    const data = await this.reviewService.updateReviewStatus(id, status ?? '', adminNote, admin);
    return { success: true, data };
  }
}
