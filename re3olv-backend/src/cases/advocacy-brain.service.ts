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
      Act as a debt counselor. If the user's message indicates job loss, illness, or extreme financial hardship, output JSON: { "hardshipDetected": true, "reason": string }. Otherwise, output false.
      
      Story: "${story}"
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      this.logger.log(`AI Text Output: ${text}`);

      let analysis = { hardshipDetected: false, reason: '' };
      
      if (text.toLowerCase().includes('false')) {
        analysis.hardshipDetected = false;
      } else {
        const jsonMatch = text.match(/\{.*\}/s);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        }
      }

      this.logger.log(`Parsed Analysis result: ${JSON.stringify(analysis)}`);

      if (analysis.hardshipDetected) {
        this.logger.log(`Hardship detected for case ${caseId}. Applying Advocacy Shield automatically...`);
        await this.casesService.applyAdvocacy(caseId, analysis.reason);
      }

      return analysis;
    } catch (error) {
      this.logger.error(`Error analyzing hardship story: ${error.message}`);
      throw error;
    }
  }
}
