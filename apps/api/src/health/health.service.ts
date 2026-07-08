import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDatabaseStatus(): Promise<string> {
    const connected = await this.prisma.isConnected();
    if (!connected) {
      this.logger.error('Database health check failed: not connected');
      return 'disconnected';
    }
    return 'connected';
  }
}
