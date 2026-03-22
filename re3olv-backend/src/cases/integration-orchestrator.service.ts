import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

export interface PaymentProvider {
  createSettlementLink(amount: number, currency: string): Promise<string>;
}

export interface ERPProvider {
  getOutstandingInvoices(registrationNumber: string): Promise<any[]>;
}

@Injectable()
class StripeAdapter implements PaymentProvider {
  async createSettlementLink(amount: number, currency: string) {
    return `https://checkout.stripe.com/pay/cs_test_${Math.random().toString(36).substring(7)}?amt=${amount}&cur=${currency}`;
  }
}

@Injectable()
class CMIMoroccoAdapter implements PaymentProvider {
  async createSettlementLink(amount: number, currency: string) {
    return `https://payment.cmi.co.ma/ref_${Math.random().toString(36).substring(7)}?amount=${amount}&currency=${currency}`;
  }
}

@Injectable()
class SAPAdapter implements ERPProvider {
  async getOutstandingInvoices(registrationNumber: string) {
    return [{ id: 'INV-SAP-001', amount: 5000, dueDate: '2026-04-01' }];
  }
}

@Injectable()
class OracleAdapter implements ERPProvider {
  async getOutstandingInvoices(registrationNumber: string) {
    return [{ id: 'INV-ORACLE-99', amount: 12000, dueDate: '2026-05-15' }];
  }
}

@Injectable()
export class IntegrationOrchestratorService {
  private readonly logger = new Logger(IntegrationOrchestratorService.name);
  private prisma: PrismaClient;

  constructor() {
    const adapter = new PrismaBetterSqlite3({
      url: 'file:./dev.db',
    });
    this.prisma = new PrismaClient({ adapter });
  }

  async getPaymentAdapter(countryCode: string): Promise<PaymentProvider> {
    const config = await this.prisma.regionConfig.findUnique({ where: { countryCode } });
    const adapters = config?.activeAdapters ? JSON.parse(config.activeAdapters) : {};
    
    if (adapters.PAYMENTS === 'CMI') return new CMIMoroccoAdapter();
    return new StripeAdapter();
  }

  async getERPAdapter(countryCode: string): Promise<ERPProvider> {
    const config = await this.prisma.regionConfig.findUnique({ where: { countryCode } });
    const adapters = config?.activeAdapters ? JSON.parse(config.activeAdapters) : {};
    
    if (adapters.ERP === 'Oracle') return new OracleAdapter();
    return new SAPAdapter();
  }

  async getRegionConfig(countryCode: string) {
    return this.prisma.regionConfig.findUnique({ where: { countryCode } });
  }

  async updateRegionConfig(countryCode: string, data: any) {
    return this.prisma.regionConfig.upsert({
      where: { countryCode },
      update: {
        activeAdapters: JSON.stringify(data.activeAdapters),
        complianceRules: JSON.stringify(data.complianceRules),
      },
      create: {
        countryCode,
        activeAdapters: JSON.stringify(data.activeAdapters),
        complianceRules: JSON.stringify(data.complianceRules),
      },
    });
  }
}
