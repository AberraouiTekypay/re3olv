import { Controller, Get, Post, Body, Param, NotFoundException, Query, UseGuards, Req } from '@nestjs/common';
import { CasesService } from './cases.service.js';
import { AdvocacyBrainService } from './advocacy-brain.service.js';
import { LinkService } from './link.service.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('cases')
@UseGuards(RolesGuard)
export class CasesController {
  constructor(
    private readonly casesService: CasesService,
    private readonly advocacyBrainService: AdvocacyBrainService,
    private readonly linkService: LinkService,
  ) {}

  @Get()
  @Roles('AGENT', 'MANAGER')
  async findAll(@Req() req: Request) {
    return this.casesService.findAll(req['orgId']);
  }

  @Get(':id')
  @Roles('AGENT', 'MANAGER')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const caseData = await this.casesService.findOne(id, req['orgId']);
    if (!caseData) {
      throw new NotFoundException(`Case with ID ${id} not found in your organization`);
    }
    return caseData;
  }

  @Get(':id/magic-link')
  @Roles('AGENT', 'MANAGER')
  async generateMagicLink(@Param('id') id: string) {
    return this.linkService.generateMagicLink(id);
  }

  @Post(':id/view')
  async trackView(@Param('id') id: string, @Query('token') token?: string) {
    // Portal views are public but tracked
    if (token) {
      const isValid = await this.linkService.validateToken(id, token);
      if (!isValid) return { success: false, message: 'Invalid token' };
    }
    await this.casesService.trackView(id);
    return { success: true };
  }

  @Get(':id/options')
  async getOptions(@Param('id') id: string) {
    // Portal options are public
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
  @Roles('AGENT')
  async applyAdvocacy(@Param('id') id: string) {
    const updatedCase = await this.casesService.applyAdvocacy(id, 'Manual intervention', true);
    if (!updatedCase) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return updatedCase;
  }

  @Post(':id/toggle-freeze')
  @Roles('AGENT')
  async toggleFreeze(@Param('id') id: string, @Body('freeze') freeze: boolean) {
    const updatedCase = await this.casesService.toggleFeeFreeze(id, freeze);
    if (!updatedCase) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return updatedCase;
  }

  @Get('analytics/roi')
  @Roles('MANAGER')
  async getROI(@Req() req: Request) {
    return this.casesService.getROIStats(req['orgId']);
  }
}
