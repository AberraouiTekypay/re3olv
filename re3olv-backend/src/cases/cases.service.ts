import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

@Injectable()
export class CasesService {
  private prisma: PrismaClient;

  constructor() {
    const adapter = new PrismaBetterSqlite3({
      url: 'file:./dev.db',
    });
    this.prisma = new PrismaClient({ adapter });
  }

  async findOne(id: string) {
    return this.prisma.case.findUnique({
      where: { id },
    });
  }

  async getSettlementOptions(caseId: string) {
    const caseData = await this.findOne(caseId);
    if (!caseData) return null;

    const total = caseData.totalAmount;

    return [
      {
        id: 'lump-sum',
        name: 'Lump Sum Settlement',
        description: 'Pay a discounted amount in one single payment.',
        amount: total * 0.6,
        type: 'ONE_TIME',
        savings: total * 0.4,
      },
      {
        id: 'short-term',
        name: 'Short-term Plan',
        description: 'Pay the full amount over 6 monthly installments.',
        amount: total,
        type: 'INSTALLMENTS',
        installments: 6,
        monthlyPayment: total / 6,
      },
      {
        id: 'long-term',
        name: 'Long-term Plan',
        description: 'Pay over 12 months with a small interest.',
        amount: total * 1.1,
        type: 'INSTALLMENTS',
        installments: 12,
        monthlyPayment: (total * 1.1) / 12,
      },
    ];
  }
}
