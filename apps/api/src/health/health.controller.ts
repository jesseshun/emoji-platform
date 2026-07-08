import { Controller, Get } from '@nestjs/common';
import { ApiResponse, HealthStatus, StatusInfo } from '@emoji-platform/types';
import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  getHealth(): ApiResponse<HealthStatus> {
    return {
      success: true,
      data: {
        status: 'ok',
        service: 'emoji-api',
      },
    };
  }

  @Get('status')
  async getStatus(): Promise<ApiResponse<StatusInfo>> {
    const database = await this.healthService.getDatabaseStatus();
    return {
      success: true,
      data: {
        status: 'ok',
        service: 'emoji-api',
        phase: 'phase-2',
        database,
      },
    };
  }
}
