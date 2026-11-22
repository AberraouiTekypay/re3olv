import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class ProviderOrchestratorService {
  private readonly logger = new Logger(ProviderOrchestratorService.name);
  constructor(private readonly prisma: PrismaService) {}

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
