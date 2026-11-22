import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { AppService } from './app.service.js';
import { PrismaService } from './database/prisma.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly prisma: PrismaService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health/live')
  getLiveness() {
    return { status: 'ok' };
  }

  @Get('health/ready')
  async getReadiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready' };
    } catch {
      throw new ServiceUnavailableException({ status: 'not_ready' });
    }
  }
}
