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

  async findAll() {
    return this.prisma.case.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.case.findUnique({
      where: { id },
    });
  }

  async getSettlementOptions(caseId: string) {
    const caseData = await this.findOne(caseId);
    if (!caseData) return null;

    const total = caseData.totalAmount - (caseData.penaltyWaived || 0);
    const isFrozen = caseData.isFeeFrozen;

    return [
      {
        id: 'lump-sum',
        name: 'Lump Sum Settlement',
        description: 'Pay a discounted amount in one single payment.',
        amount: total * 0.6,
        type: 'ONE_TIME',
        savings: (caseData.totalAmount - (total * 0.6)),
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
        description: isFrozen ? 'Pay over 12 months with 0% interest (Advocacy Shield).' : 'Pay over 12 months with a small interest.',
        amount: isFrozen ? total : total * 1.1,
        type: 'INSTALLMENTS',
        installments: 12,
        monthlyPayment: (isFrozen ? total : total * 1.1) / 12,
      },
    ];
  }

  async resolveCase(caseId: string, optionId: string) {
    return this.prisma.case.update({
      where: { id: caseId },
      data: {
        status: 'RESOLVED',
        selectedOptionId: optionId,
      },
    });
  }

  async startAdvocacy(caseId: string) {
    console.log(`Starting advocacy for case ${caseId}`);
    return this.prisma.case.update({
      where: { id: caseId },
      data: {
        status: 'ADVOCACY',
      },
    });
  }

  async applyAdvocacy(caseId: string, hardshipReason?: string) {
    return this.prisma.case.update({
      where: { id: caseId },
      data: {
        isFeeFrozen: true,
        penaltyWaived: 50.0,
        hardshipReason,
      },
    });
  }

  async getROIStats() {
    const cases = await this.findAll();
    
    let totalManaged = 0;
    let totalCollected = 0;
    let totalWaived = 0;
    let resolvedCount = 0;

    for (const c of cases) {
      totalManaged += c.totalAmount;
      if (c.penaltyWaived) totalWaived += c.penaltyWaived;

      if (c.status === 'RESOLVED' && c.selectedOptionId) {
        resolvedCount++;
        const base = c.totalAmount - (c.penaltyWaived || 0);
        let collected = 0;
        
        if (c.selectedOptionId === 'lump-sum') {
          collected = base * 0.6;
          totalWaived += base * 0.4;
        } else if (c.selectedOptionId === 'short-term') {
          collected = base;
        } else if (c.selectedOptionId === 'long-term') {
          collected = c.isFeeFrozen ? base : base * 1.1;
          if (!c.isFeeFrozen) {
             // Technically "extra" ROI, not impact
          }
        }
        totalCollected += collected;
      }
    }

    return {
      totalManaged,
      totalCollected,
      totalWaived,
      resolvedCount,
      totalCases: cases.length,
      roi: totalManaged > 0 ? (totalCollected / totalManaged) * 100 : 0,
      socialImpact: totalManaged > 0 ? (totalWaived / totalManaged) * 100 : 0,
    };
  }
}
