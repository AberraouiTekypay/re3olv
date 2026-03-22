import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { Readable } from 'stream';
import csv from 'csv-parser';
import { randomBytes } from 'crypto';

@Injectable()
export class CasesService {
  private prisma: PrismaClient;

  constructor() {
    const adapter = new PrismaBetterSqlite3({
      url: 'file:./dev.db',
    });
    this.prisma = new PrismaClient({ adapter });
  }

  async findAll(organizationId?: string) {
    return this.prisma.case.findMany({
      where: organizationId ? { organizationId } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBatchUploads(organizationId: string) {
    return this.prisma.batchUpload.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBatchUpload(filename: string, organizationId: string) {
    return this.prisma.batchUpload.create({
      data: {
        filename,
        organizationId,
        status: 'PROCESSING',
      },
    });
  }

  async processCsv(batchId: string, organizationId: string, buffer: Buffer) {
    const results: any[] = [];
    const stream = Readable.from(buffer);
    let totalRows = 0;
    let errorCount = 0;

    return new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => {
          results.push(data);
          totalRows++;
        })
        .on('end', async () => {
          try {
            for (const row of results) {
              const borrowerName = row['Borrower Name'] || row['borrowerName'] || row['Name'];
              const principalAmount = parseFloat(row['Amount'] || row['principalAmount'] || row['Principal'] || '0');
              const penalty = parseFloat(row['Penalty'] || row['penalty'] || '0');
              const totalAmount = principalAmount + penalty;

              if (!borrowerName || isNaN(totalAmount)) {
                errorCount++;
                continue;
              }

              const magicToken = randomBytes(16).toString('hex');

              await this.prisma.case.create({
                data: {
                  borrowerName,
                  principalAmount,
                  totalAmount,
                  organizationId,
                  batchUploadId: batchId,
                  status: 'OPEN',
                  magicToken,
                  magicLinkCreatedAt: new Date(),
                },
              });
            }

            await this.prisma.batchUpload.update({
              where: { id: batchId },
              data: { status: 'COMPLETED', totalRows, errorCount },
            });
            resolve({ totalRows, errorCount });
          } catch (error) {
            await this.prisma.batchUpload.update({
              where: { id: batchId },
              data: { status: 'FAILED', totalRows, errorCount },
            });
            reject(error);
          }
        })
        .on('error', async (error) => {
          await this.prisma.batchUpload.update({
            where: { id: batchId },
            data: { status: 'FAILED', totalRows, errorCount },
          });
          reject(error);
        });
    });
  }

  async nudgeCase(caseId: string) {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) return null;

    const token = caseData.magicToken;
    const magicLink = `http://localhost:3000/resolve/${caseId}?token=${token}`;
    const message = `Hi ${caseData.borrowerName}, I am Nova from RE3OLV. I have a debt relief proposal ready for you. View here: ${magicLink}`;

    await this.prisma.case.update({
      where: { id: caseId },
      data: {
        lastNudgedAt: new Date(),
      },
    });

    return { message, magicLink };
  }

  async findOne(id: string, organizationId?: string) {
    return this.prisma.case.findUnique({
      where: organizationId ? { id, organizationId } : { id },
      include: { 
        actionLogs: { orderBy: { createdAt: 'desc' } },
        chatMessages: { orderBy: { createdAt: 'asc' } },
        externalDebts: true,
        incomes: true,
        expenses: true,
      },
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

  async settleCase(caseId: string, amount: number) {
    return this.prisma.case.update({
      where: { id: caseId },
      data: {
        status: 'SETTLED',
        paidAmount: amount,
        settledAt: new Date(),
      },
    });
  }

  async trackView(caseId: string) {
    await this.prisma.actionLog.create({
      data: {
        caseId,
        action: 'MAGIC_LINK_VIEW',
        details: 'User accessed the resolution portal via magic link.',
      }
    });

    return this.prisma.case.update({
      where: { id: caseId },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    });
  }

  async startAdvocacy(caseId: string) {
    return this.prisma.case.update({
      where: { id: caseId },
      data: {
        status: 'ADVOCACY',
      },
    });
  }

  async applyAdvocacy(caseId: string, hardshipReason?: string, isManual: boolean = false) {
    await this.prisma.actionLog.create({
      data: {
        caseId,
        action: isManual ? 'MANUAL_OVERRIDE' : 'NOVA_SHIELD_TRIGGER',
        details: isManual ? 'Agent manually adjusted fees.' : `Nova detected hardship: ${hardshipReason}`,
      }
    });

    return this.prisma.case.update({
      where: { id: caseId },
      data: {
        isFeeFrozen: true,
        penaltyWaived: 50.0,
        hardshipReason,
      },
    });
  }

  async toggleFeeFreeze(caseId: string, freeze: boolean) {
    await this.prisma.actionLog.create({
      data: {
        caseId,
        action: 'MANUAL_OVERRIDE',
        details: `Agent ${freeze ? 'froze' : 'unfroze'} fees manually.`,
      }
    });

    return this.prisma.case.update({
      where: { id: caseId },
      data: {
        isFeeFrozen: freeze,
      },
    });
  }

  async getROIStats(organizationId?: string) {
    const cases = await this.findAll(organizationId);
    
    let totalManaged = 0;
    let totalCollected = 0;
    let totalWaived = 0;
    let settledCount = 0;
    let totalVelocityMs = 0;

    for (const c of cases) {
      totalManaged += c.totalAmount;
      totalWaived += c.penaltyWaived || 0;

      if (c.status === 'SETTLED') {
        settledCount++;
        totalCollected += c.paidAmount;
        
        if (c.magicLinkCreatedAt && c.settledAt) {
          totalVelocityMs += (c.settledAt.getTime() - c.magicLinkCreatedAt.getTime());
        }
      }
    }

    const avgVelocityDays = settledCount > 0 && totalVelocityMs > 0 
      ? (totalVelocityMs / settledCount) / (1000 * 60 * 60 * 24)
      : 0;

    return {
      totalManaged,
      totalCollected,
      totalWaived,
      settledCount,
      totalCases: cases.length,
      roi: totalManaged > 0 ? (totalCollected / totalManaged) * 100 : 0,
      socialImpact: totalManaged > 0 ? (totalWaived / totalManaged) * 100 : 0,
      recoveryVelocity: avgVelocityDays.toFixed(1),
    };
  }

  async getChatHistory(caseId: string) {
    return this.prisma.chatMessage.findMany({
      where: { caseId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async deleteCaseData(caseId: string) {
    // GDPR 'Right to be Forgotten' - Cascade deletion handled by relations
    return this.prisma.case.delete({
      where: { id: caseId },
    });
  }

  async logComplianceAction(caseId: string, action: string, reasoning: string) {
    return this.prisma.complianceAudit.create({
      data: {
        caseId,
        action,
        reasoning,
        regulatoryRef: 'EU-AI-ACT-2026-COMPLIANT',
      },
    });
  }
}
