import { Controller, Get, Post, Body, Param, NotFoundException, Query, UseGuards, Req, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CasesService } from './cases.service.js';
import { AdvocacyBrainService } from './advocacy-brain.service.js';
import { LinkService } from './link.service.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { ApiOperation, ApiResponse, ApiTags, ApiHeader } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('cases')
@ApiHeader({ name: 'x-organization-id', description: 'Tenant Identifier' })
@Controller('cases')
@UseGuards(RolesGuard)
export class CasesController {
  constructor(
    private readonly casesService: CasesService,
    private readonly advocacyBrainService: AdvocacyBrainService,
    private readonly linkService: LinkService,
    private readonly providerOrchestratorService: ProviderOrchestratorService,
  ) {}

  @Get()
  @Roles('AGENT', 'MANAGER')
  @ApiOperation({ summary: 'Retrieve all cases for the tenant organization' })
  async findAll(@Req() req: Request) {
    return this.casesService.findAll(req['orgId']);
  }

  @Get('providers')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Regional: List all available data providers globally' })
  async listProviders() {
    return this.providerOrchestratorService.listAllProviders();
  }

  @Get('providers/active')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Regional: List active providers for the tenant' })
  async listActiveProviders(@Req() req: Request) {
    const org = await this.casesService.getOrganizationBranding(req['orgId']); // Reusing this to get full org
    // Actually we need a specific method or include activeProviders
    return this.providerOrchestratorService.getActiveProvider('ALL', 'ALL', req['orgId']); // Placeholder logic
  }

  @Post('providers/:id/toggle')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Regional: Activate/Deactivate a provider for the tenant' })
  async toggleProvider(@Param('id') id: string, @Req() req: Request, @Body() body: { active: boolean }) {
    return this.providerOrchestratorService.toggleProvider(req['orgId'], id, body.active);
  }

  @Post('upload')
  @Roles('AGENT', 'MANAGER')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Bulk Ingest: Process CSV for portfolio creation' })
  async uploadCases(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request
  ) {
    const orgId = req['orgId'];
    const batch = await this.casesService.createBatchUpload(file.originalname, orgId);
    
    // Process CSV
    await this.casesService.processCsv(batch.id, orgId, file.buffer);
    
    return { 
      success: true, 
      batchId: batch.id,
      message: 'Processing completed'
    };
  }

  @Get('uploads')
  @Roles('AGENT', 'MANAGER')
  @ApiOperation({ summary: 'Retrieve bulk upload history' })
  async getUploads(@Req() req: Request) {
    return this.casesService.findBatchUploads(req['orgId']);
  }

  @Post(':id/nudge')
  @Roles('AGENT')
  @ApiOperation({ summary: 'Outreach: Generate personalized nudge message and track action' })
  async nudgeCase(@Param('id') id: string) {
    const result = await this.casesService.nudgeCase(id);
    if (!result) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return result;
  }

  @Post(':id/nudge-approved')
  @Roles('AGENT')
  @ApiOperation({ summary: 'Outreach: Send approval nudge with PDF link' })
  async nudgeApproved(@Param('id') id: string) {
    const result = await this.casesService.nudgeApproved(id);
    if (!result) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return result;
  }

  @Get(':id/offer-pdf')
  @ApiOperation({ summary: 'Download Restructuring Offer Letter (PDF/TXT)' })
  async downloadOffer(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    const result = await this.casesService.generateOfferPdf(id);
    if (!result) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    // Simple response for demo purposes
    return result.content;
  }

  @Get(':id')
  @Roles('AGENT', 'MANAGER')
  @ApiOperation({ summary: 'Retrieve full 360-degree case data' })
  @ApiResponse({ status: 200, description: 'Includes action logs, chat history, and external debts' })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const caseData = await this.casesService.findOne(id, req['orgId']);
    if (!caseData) {
      throw new NotFoundException(`Case with ID ${id} not found in your organization`);
    }
    return caseData;
  }

  @Get(':id/magic-link')
  @Roles('AGENT', 'MANAGER')
  @ApiOperation({ summary: 'Generate a secure, expiring token for borrower outreach' })
  async generateMagicLink(@Param('id') id: string) {
    return this.linkService.generateMagicLink(id);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Track a portal visit (Public/Tokenized)' })
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
  @ApiOperation({ summary: 'Retrieve dynamic settlement options based on hardship' })
  async getOptions(@Param('id') id: string) {
    // Portal options are public
    const options = await this.casesService.getSettlementOptions(id);
    if (!options) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return options;
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Submit a settlement plan selection' })
  async resolveCase(@Param('id') id: string, @Body('optionId') optionId: string) {
    const updatedCase = await this.casesService.resolveCase(id, optionId);
    if (!updatedCase) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return updatedCase;
  }

  @Post(':id/settle')
  @ApiOperation({ summary: 'Finalize payment and set case to SETTLED' })
  async settleCase(@Param('id') id: string, @Body('amount') amount: number) {
    const updatedCase = await this.casesService.settleCase(id, amount);
    if (!updatedCase) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return updatedCase;
  }

  @Post(':id/chat')
  @ApiOperation({ summary: 'Nova Advocacy Brain: Process hardship story via Gemini AI' })
  async processHardship(@Param('id') id: string, @Body('story') story: string) {
    return this.advocacyBrainService.processHardshipStory(id, story);
  }

  @Get(':id/chat-history')
  @ApiOperation({ summary: 'Retrieve full dialogue transcript for rehydration' })
  async getChatHistory(@Param('id') id: string) {
    return this.casesService.getChatHistory(id);
  }

  @Post(':id/apply-advocacy')
  @Roles('AGENT')
  @ApiOperation({ summary: 'Manual override: Force activate Advocacy Shield' })
  async applyAdvocacy(@Param('id') id: string) {
    const updatedCase = await this.casesService.applyAdvocacy(id, 'Manual intervention', true);
    if (!updatedCase) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return updatedCase;
  }

  @Post(':id/toggle-freeze')
  @Roles('AGENT')
  @ApiOperation({ summary: 'Emergency fee freeze/unfreeze' })
  async toggleFreeze(@Param('id') id: string, @Body('freeze') freeze: boolean) {
    const updatedCase = await this.casesService.toggleFeeFreeze(id, freeze);
    if (!updatedCase) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return updatedCase;
  }

  @Get('analytics/roi')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Institutional Analytics: Portfolio ROI & Social Impact' })
  async getROI(@Req() req: Request) {
    return this.casesService.getROIStats(req['orgId']);
  }

  @Get('admin/stats')
  @Roles('AGENT', 'MANAGER')
  @ApiOperation({ summary: 'Executive Dashboard: Aggregate portfolio metrics' })
  async getAdminStats(@Req() req: Request) {
    return this.casesService.getAdminStats(req['orgId']);
  }

  @Get('organization/branding')
  @Roles('AGENT', 'MANAGER')
  @ApiOperation({ summary: 'Branding: Retrieve tenant customization settings' })
  async getBranding(@Req() req: Request) {
    return this.casesService.getOrganizationBranding(req['orgId']);
  }

  @Post('organization/branding')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Branding: Update logo and colors for co-branded experience' })
  async updateBranding(@Req() req: Request, @Body() body: any) {
    return this.casesService.updateOrganizationBranding(req['orgId'], body);
  }

  @Post('restructure/:id')
  @ApiOperation({ summary: 'B2B2C Engine: Consolidation & Restructuring Proposal' })
  async restructure(@Param('id') id: string) {
    const result = await this.casesService.restructureDebt(id);
    if (!result) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return result;
  }

  @Delete(':id')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'GDPR Right to be Forgotten: Permanent data erasure' })
  async deleteCase(@Param('id') id: string) {
    return this.casesService.deleteCaseData(id);
  }
}
