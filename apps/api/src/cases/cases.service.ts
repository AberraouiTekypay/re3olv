import {
  BadRequestException,
  ConflictException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Readable } from 'stream';
import csv from 'csv-parser';
import { createHash } from 'crypto';
import { LinkService } from './link.service.js';
import { PrismaService } from '../database/prisma.service.js';
import type { BrandingDto } from './dto/case-write.dto.js';

const MAX_UPLOAD_ROWS = 5000;
const MAX_AMOUNT = 100_000_000;

type UploadRow = {
  borrowerName: string;
  principalAmount: number;
  totalAmount: number;
};

type HardshipOutcome = {
  hardshipDetected: boolean;
  isVerified: boolean;
  reason: string;
  novaResponse: string;
  complianceReasoning?: string;
};

@Injectable()
export class CasesService {
  constructor(
    private readonly linkService: LinkService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(organizationId: string) {
    return this.prisma.case.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        borrowerName: true,
        totalAmount: true,
        paidAmount: true,
        status: true,
        selectedOptionId: true,
        isFeeFrozen: true,
        penaltyWaived: true,
        hardshipReason: true,
        viewCount: true,
        lastViewedAt: true,
        createdAt: true,
      },
    });
  }

  async findBatchUploads(organizationId: string) {
    return this.prisma.batchUpload.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBatchUpload(
    filename: string,
    organizationId: string,
    idempotencyKey: string,
    requestHash: string,
  ) {
    return this.prisma.batchUpload.create({
      data: {
        filename,
        organizationId,
        idempotencyKey,
        requestHash,
        status: 'PROCESSING',
      },
    });
  }

  async batchUpload(
    buffer: Buffer,
    organizationId: string,
    filename: string,
    idempotencyKey: string,
  ) {
    const requestHash = createHash('sha256').update(buffer).digest('hex');
    let batchId: string;
    try {
      const batch = await this.createBatchUpload(
        filename,
        organizationId,
        idempotencyKey,
        requestHash,
      );
      batchId = batch.id;
    } catch (error) {
      if (!this.isUniqueConstraintError(error)) throw error;
      const existing = await this.prisma.batchUpload.findUnique({
        where: {
          organizationId_idempotencyKey: { organizationId, idempotencyKey },
        },
      });
      if (!existing) throw error;
      if (existing.requestHash !== requestHash) {
        throw new ConflictException(
          'Idempotency-Key was already used for a different upload',
        );
      }
      return {
        id: existing.id,
        status: existing.status,
        totalRows: existing.totalRows,
        errorCount: existing.errorCount,
        replayed: true,
      };
    }

    let totalRows = 0;
    let errorCount = 0;
    const rows: UploadRow[] = [];
    try {
      const parser = Readable.from([buffer]).pipe(
        csv({
          strict: true,
          maxRowBytes: 1024 * 1024,
          mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '').trim(),
        }),
      );
      try {
        for await (const row of parser) {
          totalRows++;
          if (totalRows > MAX_UPLOAD_ROWS) {
            throw new BadRequestException(`CSV exceeds the ${MAX_UPLOAD_ROWS} row limit`);
          }
          const borrowerName = String(
            row['Borrower Name'] ?? row.borrowerName ?? row.Name ?? '',
          ).trim();
          const principalRaw = String(
            row.Amount ?? row.principalAmount ?? row.Principal ?? '',
          ).trim();
          const penaltyRaw = String(row.Penalty ?? row.penalty ?? '0').trim();
          const moneyPattern = /^(?:0|[1-9]\d{0,8})(?:\.\d{1,2})?$/;
          if (
            !borrowerName ||
            borrowerName.length > 200 ||
            !moneyPattern.test(principalRaw) ||
            !moneyPattern.test(penaltyRaw)
          ) {
            errorCount++;
            continue;
          }
          const principalAmount = Number(principalRaw);
          const penalty = Number(penaltyRaw);
          if (
            principalAmount <= 0 ||
            principalAmount + penalty > MAX_AMOUNT
          ) {
            errorCount++;
            continue;
          }
          rows.push({
            borrowerName,
            principalAmount,
            totalAmount: principalAmount + penalty,
          });
        }
      } catch (error) {
        if (error instanceof BadRequestException) throw error;
        throw new BadRequestException('CSV file could not be parsed');
      }
      if (totalRows === 0) {
        throw new BadRequestException('CSV must contain at least one data row');
      }
      if (errorCount > 0) {
        throw new BadRequestException(`${errorCount} CSV row(s) failed validation`);
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.case.createMany({
          data: rows.map((row) => ({
            ...row,
            organizationId,
            batchUploadId: batchId,
            status: 'OPEN',
          })),
        });
        await tx.batchUpload.update({
          where: { id: batchId },
          data: { status: 'COMPLETED', totalRows, errorCount: 0 },
        });
      });
      return { id: batchId, status: 'COMPLETED', totalRows, errorCount: 0 };
    } catch (error) {
      await this.prisma.batchUpload.update({
        where: { id: batchId },
        data: { status: 'FAILED', totalRows, errorCount: Math.max(errorCount, 1) },
      });
      throw error;
    }
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    );
  }

  async triggerAdvocacy(caseId: string, reason: string) {
    return this.applyAdvocacy(caseId, reason, reason === 'MANUAL_OVERRIDE');
  }

  async nudgeCase(caseId: string, organizationId: string) {
    const caseData = await this.prisma.case.findFirst({
      where: { id: caseId, organizationId },
    });

    if (!caseData) return null;

    const link = await this.linkService.generateMagicLink(caseId, organizationId);
    if (!link) return null;
    const magicLink = link.url;
    const message = `Hi ${caseData.borrowerName}, I am Nova from RE3OLV. I have a debt relief proposal ready for you. View here: ${magicLink}`;

    await this.prisma.case.update({
      where: { id: caseId, organizationId },
      data: {
        lastNudgedAt: new Date(),
      },
    });

    return { message, magicLink };
  }

  async getAdminStats(organizationId: string) {
    const cases = await this.prisma.case.findMany({
      where: { organizationId },
    });

    const totalManagedDebt = cases.reduce(
      (acc, c) => acc + c.principalAmount,
      0,
    );

    // Potential Recovery: Sum of settled amounts for SETTLED, or 60% (Lump Sum) for others
    const potentialRecovery = cases.reduce((acc, c) => {
      if (c.status === 'SETTLED') return acc + c.paidAmount;
      return acc + c.totalAmount * 0.6;
    }, 0);

    const settledCount = cases.filter((c) => c.status === 'SETTLED').length;
    const openCount = cases.filter((c) => c.status === 'OPEN').length;
    const portfolioHealth =
      openCount > 0 ? (settledCount / (settledCount + openCount)) * 100 : 100;

    // Active Negotiations: Viewed in last 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeNegotiations = cases.filter(
      (c) => c.lastViewedAt && new Date(c.lastViewedAt) > twentyFourHoursAgo,
    ).length;

    const totalWaived = cases.reduce(
      (acc, c) => acc + (c.penaltyWaived || 0),
      0,
    );

    return {
      totalManagedDebt,
      potentialRecovery,
      portfolioHealth,
      activeNegotiations,
      totalWaived,
      totalCases: cases.length,
    };
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

  async getBorrowerPortalCase(id: string) {
    return this.prisma.case.findUnique({
      where: { id },
      select: {
        id: true,
        borrowerName: true,
        isSME: true,
        founderName: true,
        founderImpact: true,
        verificationMethod: true,
        totalAmount: true,
        status: true,
        paidAmount: true,
        isFeeFrozen: true,
        penaltyWaived: true,
        hardshipReason: true,
        selectedOptionId: true,
      },
    });
  }

  async getBorrowerDebtDetails(id: string) {
    return this.prisma.case.findUnique({
      where: { id },
      select: {
        id: true,
        borrowerName: true,
        totalAmount: true,
        externalDebts: {
          select: { id: true, creditorName: true, amount: true, status: true, type: true },
        },
      },
    });
  }

  async getBorrowerBranding(id: string) {
    const caseData = await this.prisma.case.findUnique({
      where: { id },
      select: {
        organization: {
          select: { primaryColor: true, logoUrl: true },
        },
      },
    });
    return caseData?.organization ?? null;
  }

  async restructureDebtForBorrower(caseId: string) {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
      select: { organizationId: true },
    });
    if (!caseData) return null;
    return this.restructureDebt(caseId, caseData.organizationId);
  }

  async getSettlementOptions(caseId: string) {
    const caseData = await this.findOne(caseId);
    if (!caseData) return null;

    const total = Math.max(
      0,
      caseData.totalAmount - (caseData.penaltyWaived || 0) - caseData.paidAmount,
    );
    const isFrozen = caseData.isFeeFrozen;

    return [
      {
        id: 'lump-sum',
        name: 'Lump Sum Settlement',
        description: 'Pay a discounted amount in one single payment.',
        amount: total * 0.6,
        type: 'ONE_TIME',
        savings: caseData.totalAmount - total * 0.6,
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
        description: isFrozen
          ? 'Pay over 12 months with 0% interest (Advocacy Shield).'
          : 'Pay over 12 months with a small interest.',
        amount: isFrozen ? total : total * 1.1,
        type: 'INSTALLMENTS',
        installments: 12,
        monthlyPayment: (isFrozen ? total : total * 1.1) / 12,
      },
    ];
  }

  async resolveCase(caseId: string, optionId: string) {
    const validOptions = ['lump-sum', 'short-term', 'long-term'];
    if (!validOptions.includes(optionId)) {
      throw new BadRequestException('Unknown settlement option');
    }
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.case.findUnique({
        where: { id: caseId },
        select: { id: true, status: true, selectedOptionId: true },
      });
      if (!current) return null;
      if (current.status === 'RESOLVED' && current.selectedOptionId === optionId) {
        return current;
      }
      if (['SETTLED', 'RESOLVED'].includes(current.status)) {
        throw new BadRequestException('Case is already resolved');
      }
      return tx.case.update({
        where: { id: caseId, status: current.status },
        data: { status: 'RESOLVED', selectedOptionId: optionId },
        select: { id: true, status: true, selectedOptionId: true },
      });
    });
  }

  async settleCase(caseId: string, amount: number) {
    if (process.env.NODE_ENV === 'production') {
      throw new ServiceUnavailableException('Live payment processing is not configured');
    }
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.case.findUnique({
        where: { id: caseId },
        select: {
          id: true,
          totalAmount: true,
          penaltyWaived: true,
          paidAmount: true,
          status: true,
          settledAt: true,
        },
      });
      if (!current) return null;
      if (current.status === 'SETTLED' && current.paidAmount === amount) {
        return {
          id: current.id,
          status: current.status,
          paidAmount: current.paidAmount,
          settledAt: current.settledAt,
        };
      }
      if (current.status === 'SETTLED') {
        throw new BadRequestException('Case is already resolved');
      }
      const outstanding = Math.max(
        0,
        current.totalAmount - current.penaltyWaived - current.paidAmount,
      );
      if (amount > outstanding) {
        throw new BadRequestException('Settlement amount exceeds the outstanding balance');
      }
      return tx.case.update({
        where: { id: caseId, status: current.status },
        data: { status: 'SETTLED', paidAmount: current.paidAmount + amount, settledAt: new Date() },
        select: { id: true, status: true, paidAmount: true, settledAt: true },
      });
    });
  }

  async trackView(caseId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.actionLog.create({
        data: {
          caseId,
          action: 'MAGIC_LINK_VIEW',
          details: 'User accessed the resolution portal via magic link.',
        },
      });
      return tx.case.update({
        where: { id: caseId },
        data: { viewCount: { increment: 1 }, lastViewedAt: new Date() },
      });
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

  async applyAdvocacy(
    caseId: string,
    hardshipReason?: string,
    isManual: boolean = false,
    complianceReasoning?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.actionLog.create({
        data: {
          caseId,
          action: isManual ? 'MANUAL_OVERRIDE' : 'NOVA_SHIELD_TRIGGER',
          details: isManual
            ? 'Agent manually adjusted fees.'
            : `Nova detected hardship: ${hardshipReason}`,
        },
      });
      if (complianceReasoning) {
        await tx.complianceAudit.create({
          data: {
            caseId,
            action: 'SHIELD_ACTIVATION',
            reasoning: complianceReasoning,
            regulatoryRef: 'EU-AI-ACT-2026-COMPLIANT',
          },
        });
      }
      return tx.case.update({
        where: { id: caseId },
        data: {
          status: 'ADVOCACY',
          isFeeFrozen: true,
          penaltyWaived: 50.0,
          hardshipReason,
        },
        select: {
          id: true,
          status: true,
          isFeeFrozen: true,
          penaltyWaived: true,
          hardshipReason: true,
        },
      });
    });
  }

  async completeHardshipAnalysis(caseId: string, outcome: HardshipOutcome) {
    return this.prisma.$transaction(async (tx) => {
      if (outcome.hardshipDetected || outcome.isVerified) {
        await tx.actionLog.create({
          data: {
            caseId,
            action: 'NOVA_SHIELD_TRIGGER',
            details: `Nova detected hardship: ${outcome.reason}`,
          },
        });
        await tx.complianceAudit.create({
          data: {
            caseId,
            action: 'SHIELD_ACTIVATION',
            reasoning: outcome.complianceReasoning ?? outcome.reason,
            regulatoryRef: 'EU-AI-ACT-2026-COMPLIANT',
          },
        });
        await tx.case.update({
          where: { id: caseId },
          data: {
            status: 'ADVOCACY',
            isFeeFrozen: true,
            penaltyWaived: 50,
            hardshipReason: outcome.reason,
          },
        });
      }

      await tx.chatMessage.create({
        data: { caseId, sender: 'NOVA', content: outcome.novaResponse },
      });
      await tx.decisionLog.create({
        data: {
          caseId,
          decisionType: outcome.hardshipDetected || outcome.isVerified
            ? 'SHIELD_ACTIVATION'
            : 'AWAITING_MORE_INFO',
          aiConfidence: 0.95,
          humanReviewerId: null,
        },
      });
    });
  }

  async toggleFeeFreeze(caseId: string, freeze: boolean) {
    return this.prisma.$transaction(async (tx) => {
      await tx.actionLog.create({
        data: {
          caseId,
          action: 'MANUAL_OVERRIDE',
          details: `Agent ${freeze ? 'froze' : 'unfroze'} fees manually.`,
        },
      });
      return tx.case.update({
        where: { id: caseId },
        data: { isFeeFrozen: freeze },
        select: { id: true, isFeeFrozen: true },
      });
    });
  }

  async getROIStats(organizationId: string) {
    const cases = await this.prisma.case.findMany({
      where: { organizationId },
      select: {
        totalAmount: true,
        penaltyWaived: true,
        status: true,
        paidAmount: true,
        magicLinkCreatedAt: true,
        settledAt: true,
      },
    });

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
          totalVelocityMs +=
            c.settledAt.getTime() - c.magicLinkCreatedAt.getTime();
        }
      }
    }

    const avgVelocityDays =
      settledCount > 0 && totalVelocityMs > 0
        ? totalVelocityMs / settledCount / (1000 * 60 * 60 * 24)
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

  async getOrganizationBranding(organizationId: string) {
    return this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        legalName: true,
        supportEmail: true,
        regulatoryDisclaimer: true,
      },
    });
  }

  async updateOrganizationBranding(organizationId: string, data: BrandingDto) {
    return this.prisma.organization.update({
      where: { id: organizationId },
      data,
    });
  }

  async restructureDebt(caseId: string, organizationId: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new ServiceUnavailableException('Live restructuring offers are not configured');
    }
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId, organizationId },
      include: {
        externalDebts: true,
        organization: true,
      },
    });

    if (!caseData) return null;

    const mfiDebt = caseData.totalAmount;
    const externalDebtTotal = caseData.externalDebts.reduce(
      (acc, d) => acc + d.amount,
      0,
    );
    const totalExposure = mfiDebt + externalDebtTotal;

    // Consolidation Math: 12% APR (0.01 monthly), 36 months
    const monthlyRate = 0.12 / 12;
    const months = 36;
    const singleMonthlyPayment =
      (totalExposure * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const org = caseData.organization;
    const isSME = caseData.isSME;
    const subject = isSME
      ? `Founder ${caseData.founderName || caseData.borrowerName}`
      : `Business Owner ${caseData.borrowerName}`;

    const letterOfIntent = `
      ${org.logoUrl ? `[LOGO: ${org.logoUrl}]` : `[INSTITUTION: ${org.name}]`}
      
      OFFICIAL LETTER OF INTENT: DEBT CONSOLIDATION & STABILITY PLAN
      
      To Whom It May Concern,
      
      ${org.legalName || org.name}, acting as the institutional advocate for ${subject}, 
      hereby proposes a multi-creditor consolidation of the outstanding exposure 
      totaling $${totalExposure.toLocaleString()}.
      
      At RE3OLV, we understand that a business is a life's work. Our mission is to stabilize 
      both the enterprise and the founder behind it, ensuring long-term financial health.
      
      Proposed Terms:
      - Principal Buyout: $${totalExposure.toLocaleString()}
      - Restructured Rate: 12.0% Fixed APR
      - Tenure: 36 Months
      - Single Disbursement: Partner Bank 2026-X
      
      This restructuring aims to improve cash flow for survival and ensure recovery velocity.
      
      Institutional ID: ${caseData.id}
      Date: ${new Date().toLocaleDateString()}

      --------------------------------------------------
      SUPPORT: ${org.supportEmail || 'support@re3olv.ai'}
      REGULATORY: ${org.regulatoryDisclaimer}
    `;

    return {
      totalExposure,
      singleMonthlyPayment,
      letterOfIntent,
      savingsPerMonth: totalExposure * 0.025 - singleMonthlyPayment, // vs 30% APR (approx 2.5% monthly)
      numDebts: caseData.externalDebts.length + 1,
      branding: {
        primaryColor: org.primaryColor,
        secondaryColor: org.secondaryColor,
      },
    };
  }

  async nudgeApproved(caseId: string, organizationId: string) {
    const result = await this.restructureDebt(caseId, organizationId);
    if (!result) return null;

    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId, organizationId },
    });

    const monthlyPayment = Math.round(result.singleMonthlyPayment);
    const downloadLink = `http://localhost:3001/api/cases/${caseId}/offer-pdf`;
    const message = `Your consolidation offer has been approved. Your new monthly payment is $${monthlyPayment}. Download your signed letter here: ${downloadLink}`;

    await this.prisma.case.update({
      where: { id: caseId },
      data: {
        lastNudgedAt: new Date(),
      },
    });

    return { message, downloadLink };
  }

  async generateOfferPdf(caseId: string, organizationId: string) {
    const result = await this.restructureDebt(caseId, organizationId);
    if (!result) return null;

    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId, organizationId },
    });

    return {
      filename: `RE3OLV_Offer_${caseId.slice(0, 8)}.txt`, // Using TXT as a simple fallback for demo if PDF lib fails
      content: result.letterOfIntent,
    };
  }

  async deleteCaseData(caseId: string, organizationId: string) {
    // GDPR 'Right to be Forgotten' - Cascade deletion handled by relations
    const result = await this.prisma.case.deleteMany({
      where: { id: caseId, organizationId },
    });
    return { deleted: result.count === 1 };
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
