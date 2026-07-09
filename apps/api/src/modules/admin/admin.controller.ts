import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from './admin-auth.guard';

@Controller('admin')
export class AdminController {
  @Get('health')
  @UseGuards(AdminAuthGuard)
  async health() {
    return {
      success: true,
      data: {
        status: 'ok',
        service: 'admin',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
