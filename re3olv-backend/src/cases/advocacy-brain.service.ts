import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CasesService } from './cases.service.js';

@Injectable()
export class AdvocacyBrainService {
  private readonly logger = new Logger(AdvocacyBrainService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private casesService: CasesService) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async processHardshipStory(caseId: string, story: string) {
    this.logger.log(`Analyzing hardship story for case ${caseId}`);

    const model = this.genAI.getGenerativeModel({ model: 'gemini-3-flash' });

    const prompt = `
      Analyze the following debtor's hardship story and determine if they are in financial distress.
      Respond with a JSON object containing:
      - "isFinancialDistress": boolean
      - "reason": string summarizing the analysis
      
      Story: "${story}"
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Basic JSON extraction from markdown if necessary
      const jsonMatch = text.match(/\{.*\}/s);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { isFinancialDistress: false, reason: 'Failed to parse AI response' };

      this.logger.log(`Analysis result: ${JSON.stringify(analysis)}`);

      if (analysis.isFinancialDistress) {
        this.logger.log(`Financial distress detected for case ${caseId}. Starting advocacy...`);
        await this.casesService.startAdvocacy(caseId);
      }

      return analysis;
    } catch (error) {
      this.logger.error(`Error analyzing hardship story: ${error.message}`);
      throw error;
    }
  }
}
