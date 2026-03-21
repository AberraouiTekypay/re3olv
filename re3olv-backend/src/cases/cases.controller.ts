import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { CasesService } from './cases.service.js';
import { AdvocacyBrainService } from './advocacy-brain.service.js';

@Controller('cases')
export class CasesController {
  constructor(
    private readonly casesService: CasesService,
    private readonly advocacyBrainService: AdvocacyBrainService,
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
}
