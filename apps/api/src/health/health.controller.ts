import { Controller, Get } from '@nestjs/common';
import { ApiResponse, HealthStatus, StatusInfo } from '@emoji-platform/types';

@Controller()
export class HealthController {
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
  getStatus(): ApiResponse<StatusInfo> {
    return {
      success: true,
      data: {
        status: 'ok',
        service: 'emoji-api',
        phase: 'phase-1',
      },
    };
  }
}
