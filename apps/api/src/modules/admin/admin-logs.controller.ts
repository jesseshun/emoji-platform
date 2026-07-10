import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard, AdminJwtPayload } from './admin-auth.guard';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminLogsService } from './admin-logs.service';
import { assertCanViewLogs } from './role.util';
import { parseSearchLogsQuery, parseCopyEventsQuery } from './dto/admin-logs-query.dto';

@Controller('admin/search-logs')
export class AdminSearchLogsController {
  constructor(private readonly logsService: AdminLogsService) {}

  @Get()
  @UseGuards(AdminAuthGuard)
  async list(
    @Query() query: Record<string, string | undefined>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanViewLogs(admin.role);
    const parsed = parseSearchLogsQuery(query);
    const result = await this.logsService.listSearchLogs(parsed);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get('summary')
  @UseGuards(AdminAuthGuard)
  async summary(@CurrentAdmin() admin: AdminJwtPayload) {
    assertCanViewLogs(admin.role);
    const data = await this.logsService.searchLogsSummary();
    return { success: true, data };
  }
}

@Controller('admin/copy-events')
export class AdminCopyEventsController {
  constructor(private readonly logsService: AdminLogsService) {}

  @Get()
  @UseGuards(AdminAuthGuard)
  async list(
    @Query() query: Record<string, string | undefined>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanViewLogs(admin.role);
    const parsed = parseCopyEventsQuery(query);
    const result = await this.logsService.listCopyEvents(parsed);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get('summary')
  @UseGuards(AdminAuthGuard)
  async summary(@CurrentAdmin() admin: AdminJwtPayload) {
    assertCanViewLogs(admin.role);
    const data = await this.logsService.copyEventsSummary();
    return { success: true, data };
  }
}
