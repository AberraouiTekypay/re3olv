import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CasesService } from './cases.service.js';
import { EuropeanRegisterService } from './european-register.service.js';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class AdvocacyBrainService {
  private readonly logger = new Logger(AdvocacyBrainService.name);
  private genAI: GoogleGenerativeAI;

  constructor(
    private casesService: CasesService,
    private europeanRegisterService: EuropeanRegisterService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);

  }

  async processHardshipStory(caseId: string, story: string) {
    this.logger.log(`Analyzing hardship story for case ${caseId}`);

    // Persist User Message
    await this.prisma.chatMessage.create({
      data: {
        caseId,
        sender: 'USER',
        content: story,
      },
    });

    const caseData = await this.casesService.findOne(caseId);
    const isSME = caseData?.isSME || false;
    const isVerified = caseData?.isVerified || false;
    const verificationMethod =
      caseData?.verificationMethod || 'OFFICIAL_REGISTER';

    const model = this.genAI.getGenerativeModel(
      { model: 'gemini-3-flash' },
      { timeout: 20_000 },
    );

    const prompt = isSME
      ? `
      Act as a Founder Advocate and Debt Counselor.
      The user is an Entrepreneur / Business Owner.
      ${verificationMethod === 'OFFICIAL_REGISTER' ? 'USE FORMAL COMPLIANCE LANGUAGE.' : 'USE EMPATHETIC ADVOCACY LANGUAGE.'}
      ADOPT THE FOUNDER ADVOCATE PERSONA:
      - Prioritize Business Continuity and Team Protection language.
      - Validate the Founder's personal sacrifice (equity, home security, personal credit).
      - If the story indicates business hardship (Late Invoice, Client Default, Supply Cost, Payroll Stress, Working Capital issues), output JSON: { "hardshipDetected": true, "reason": string, "isSMETrigger": true }.
      - Otherwise, output false.
      
      Story: "${story}"
      `
      : `
      Act as a debt counselor. If the user's message indicates job loss, illness, or extreme financial hardship, output JSON: { "hardshipDetected": true, "reason": string }. Otherwise, output false.
      
      Story: "${story}"
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let analysis = {
        hardshipDetected: false,
        reason: '',
        isSMETrigger: false,
      };
      let novaResponse = isSME
        ? "I understand your business is your life's work. I couldn't detect a specific qualifying hardship yet, but if you have details on client defaults or payroll stress, please share."
        : "I'm sorry to hear that, but I couldn't detect a specific qualifying hardship in your story. If you have more details about job loss or illness, please let me know.";
      let complianceReasoning: string | undefined;

      const jsonMatch = text.match(/\{.*\}/s);
      if (jsonMatch) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          parsed = undefined;
        }
        if (typeof parsed === 'object' && parsed !== null) {
          const result = parsed as Record<string, unknown>;
          const reason =
            typeof result.reason === 'string'
              ? result.reason.trim().slice(0, 1000)
              : '';
          analysis = {
            hardshipDetected: result.hardshipDetected === true && Boolean(reason),
            reason,
            isSMETrigger: result.isSMETrigger === true && Boolean(reason),
          };
        }
      }
      if (isVerified && !analysis.reason) {
        analysis = {
          hardshipDetected: true,
          reason:
            'Financial hardship verified via Open Banking cash flow analysis.',
          isSMETrigger: false,
        };
      }

      this.logger.log(
        `Hardship analysis completed for ${caseId}; detected=${analysis.hardshipDetected}, verified=${isVerified}`,
      );

      if (analysis.hardshipDetected || isVerified) {
        this.logger.log(
          `Hardship detected for case ${caseId}. Applying Advocacy Shield automatically...`,
        );
        complianceReasoning = `Hardship detected via AI reasoning: ${analysis.reason}. Verified: ${isVerified}. SME: ${isSME}. Method: ${verificationMethod}`;

        if (isVerified) {
          novaResponse = isSME
            ? verificationMethod === 'OFFICIAL_REGISTER'
              ? "Your official registry data has been verified. I've initiated formal stability protocols and applied the institutional waiver suite."
              : "I've analyzed your business cash flow and verified the stress. Applying stability measures and the maximal Shield discount now."
            : "I've analyzed your cash flow and verified your hardship. Applying the maximal Shield discount now.";
        } else if (analysis.isSMETrigger) {
          const specificIssue = analysis.reason.toLowerCase().includes('client')
            ? 'Losing a key client'
            : analysis.reason.toLowerCase().includes('invoice')
              ? 'A late invoice'
              : analysis.reason;
          novaResponse = `${specificIssue} is tough. I'm noting this as a Business Continuity Risk for the bank's waiver review and activating your Advocacy Shield.`;
        } else {
          novaResponse = `I've analyzed your situation: "${analysis.reason}". I've activated the Advocacy Shield for you.`;
        }
      }

      await this.casesService.completeHardshipAnalysis(caseId, {
        hardshipDetected: analysis.hardshipDetected,
        isVerified,
        reason: analysis.reason,
        novaResponse,
        complianceReasoning,
      });

      return analysis;
    } catch (error) {
      this.logger.error(`Error analyzing hardship story: ${error.message}`);
      throw error;
    }
  }
}
