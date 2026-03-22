import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

@Injectable()
export class ProviderOrchestratorService {
  private readonly logger = new Logger(ProviderOrchestratorService.name);
  private prisma: PrismaClient;

  constructor() {
    const adapter = new PrismaBetterSqlite3({
      url: 'file:./dev.db',
    });
    this.prisma = new PrismaClient({ adapter });
  }

  async getActiveProvider(
    countryCode: string,
    category: string,
    organizationId: string,
  ) {
    this.logger.log(`Orchestrating provider for ${countryCode} [${category}]`);

    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        activeProviders: {
          where: { countryCode, category },
        },
      },
    });

    const provider = org?.activeProviders[0];

    if (!provider) {
      this.logger.warn(
        `No active provider found for ${countryCode} [${category}]. Implementing default fallback.`,
      );

      // Dynamic Fallback Logic
      if (countryCode === 'MA' && category === 'BUSINESS') {
        return {
          providerName: 'RE3OLV_PROXY',
          status: 'FALLBACK_ACTIVE',
          triggerSurvey: true,
          message:
            'Official Register unavailable in Morocco region. Triggering Cash-Flow Proxy survey.',
        };
      }

      return {
        providerName: 'DEFAULT_MOCK',
        status: 'STANDBY',
      };
    }

    return provider;
  }

  async listAllProviders() {
    return this.prisma.providerRegistry.findMany();
  }

  async toggleProvider(
    organizationId: string,
    providerId: string,
    active: boolean,
  ) {
    if (active) {
      return this.prisma.organization.update({
        where: { id: organizationId },
        data: {
          activeProviders: {
            connect: { id: providerId },
          },
        },
      });
    } else {
      return this.prisma.organization.update({
        where: { id: organizationId },
        data: {
          activeProviders: {
            disconnect: { id: providerId },
          },
        },
      });
    }
  }
}
