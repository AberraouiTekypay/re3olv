import { Controller, Get, Post, Body, Param, NotFoundException, Query } from '@nestjs/common';
import { CasesService } from './cases.service.js';
import { AdvocacyBrainService } from './advocacy-brain.service.js';
import { LinkService } from './link.service.js';

@Controller('cases')
export class CasesController {
  constructor(
    private readonly casesService: CasesService,
    private readonly advocacyBrainService: AdvocacyBrainService,
    private readonly linkService: LinkService,
  ) {}

  @Get()
  async findAll() {
    return this.casesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const caseData = await this.casesService.findOne(id);
    if (!caseData) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return caseData;
  }

  @Get(':id/magic-link')
  async generateMagicLink(@Param('id') id: string) {
    return this.linkService.generateMagicLink(id);
  }

  @Post(':id/view')
  async trackView(@Param('id') id: string, @Query('token') token?: string) {
    if (token) {
      const isValid = await this.linkService.validateToken(id, token);
      if (!isValid) return { success: false, message: 'Invalid token' };
    }
    await this.casesService.trackView(id);
    return { success: true };
  }

  @Get(':id/options')
  async getOptions(@Param('id') id: string) {
    const options = await this.casesService.getSettlementOptions(id);
    if (!options) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return options;
  }

  @Post(':id/resolve')
  async resolveCase(@Param('id') id: string, @Body('optionId') optionId: string) {
    const updatedCase = await this.casesService.resolveCase(id, optionId);
    if (!updatedCase) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return updatedCase;
  }

  @Post(':id/settle')
  async settleCase(@Param('id') id: string, @Body('amount') amount: number) {
    const updatedCase = await this.casesService.settleCase(id, amount);
    if (!updatedCase) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return updatedCase;
  }

  @Post(':id/chat')
  async processHardship(@Param('id') id: string, @Body('story') story: string) {
    return this.advocacyBrainService.processHardshipStory(id, story);
  }

  @Post(':id/apply-advocacy')
  async applyAdvocacy(@Param('id') id: string) {
    const updatedCase = await this.casesService.applyAdvocacy(id);
    if (!updatedCase) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return updatedCase;
  }

  @Get('analytics/roi')
  async getROI() {
    return this.casesService.getROIStats();
  }
}
