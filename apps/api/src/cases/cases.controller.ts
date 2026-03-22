import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  Query,
  UseGuards,
  Req,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CasesService } from './cases.service.js';
import { AdvocacyBrainService } from './advocacy-brain.service.js';
import { LinkService } from './link.service.js';
import { ProviderOrchestratorService } from './provider-orchestrator.service.js';
import { IntegrationOrchestratorService } from './integration-orchestrator.service.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { ApiOperation, ApiResponse, ApiTags, ApiHeader } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';

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
    private readonly integrationOrchestratorService: IntegrationOrchestratorService,
  ) {}

  @Get('regions/:countryCode/config')
  @Roles('MANAGER')
  @ApiOperation({
    summary: 'Regional: Retrieve specific country configuration',
  })
  async getRegionConfig(@Param('countryCode') countryCode: string) {
    return this.integrationOrchestratorService.getRegionConfig(countryCode);
  }

  @Post('regions/:countryCode/config')
  @Roles('MANAGER')
  @ApiOperation({
    summary: 'Regional: Update country config (Adapters & Compliance)',
  })
  async updateRegionConfig(
    @Param('countryCode') countryCode: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.integrationOrchestratorService.updateRegionConfig(
      countryCode,
      body,
    );
  }

  @Get()
  @Roles('AGENT', 'MANAGER')
  @ApiOperation({ summary: 'Retrieve all cases for the tenant organization' })
  async findAll(@Req() req: Request) {
    return this.casesService.findAll(req['orgId'] as string);
  }

  @Get('providers')
  @Roles('MANAGER')
  @ApiOperation({
    summary: 'Regional: List all available data providers globally',
  })
  async listProviders() {
    return this.providerOrchestratorService.listAllProviders();
  }

  @Get('providers/active')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Regional: List active providers for the tenant' })
  async listActiveProviders(@Req() req: Request) {
    // Actually we need a specific method or include activeProviders
    return this.providerOrchestratorService.getActiveProvider(
      'ALL',
      'ALL',
      req['orgId'] as string,
    ); // Placeholder logic
  }

  @Post('providers/:id/toggle')
  @Roles('MANAGER')
  @ApiOperation({
    summary: 'Regional: Activate/Deactivate a provider for the tenant',
  })
  async toggleProvider(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() body: { active: boolean },
  ) {
    return this.providerOrchestratorService.toggleProvider(
      req['orgId'] as string,
      id,
      body.active,
    );
  }

  @Post('upload')
  @Roles('MANAGER')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Bulk upload cases via CSV' })
  async uploadCases(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.casesService.batchUpload(file.buffer, req['orgId'] as string);
  }

  @Get(':id')
  @Roles('AGENT', 'MANAGER')
  @ApiOperation({ summary: 'Retrieve specific case details' })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const c = await this.casesService.findOne(id);
    if (!c || c.organizationId !== req['orgId']) {
      throw new NotFoundException(
        `Case with ID ${id} not found in your organization`,
      );
    }
    return c;
  }

  @Post(':id/magic-link')
  @Roles('AGENT')
  @ApiOperation({ summary: 'Generate a magic link for borrower outreach' })
  async generateMagicLink(@Param('id') id: string) {
    return this.linkService.generateMagicLink(id);
  }

  @Get(':id/track')
  @ApiOperation({ summary: 'Track borrower view' })
  async trackView(@Param('id') id: string, @Query('token') token?: string) {
    if (token) {
      const isValid = await this.linkService.validateToken(id, token);
      if (!isValid) throw new NotFoundException('Invalid or expired token');
    }
    await this.casesService.trackView(id);
    return { status: 'tracked' };
  }

  @Get(':id/settlement-options')
  @ApiOperation({ summary: 'Retrieve available settlement options' })
  async getOptions(@Param('id') id: string) {
    const options = await this.casesService.getSettlementOptions(id);
    if (!options) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return options;
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Accept a settlement option' })
  async resolveCase(
    @Param('id') id: string,
    @Body('optionId') optionId: string,
  ) {
    const updatedCase = await this.casesService.resolveCase(id, optionId);
    if (!updatedCase) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return updatedCase;
  }

  @Post(':id/settle')
  @ApiOperation({ summary: 'Settle case manually with custom amount' })
  async settleCase(@Param('id') id: string, @Body('amount') amount: number) {
    const updatedCase = await this.casesService.settleCase(id, amount);
    if (!updatedCase) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return updatedCase;
  }

  @Post(':id/hardship')
  @ApiOperation({ summary: 'Process borrower hardship story via AI' })
  async processHardship(@Param('id') id: string, @Body('story') story: string) {
    return this.advocacyBrainService.processHardshipStory(id, story);
  }

  @Get(':id/chat')
  @ApiOperation({ summary: 'Retrieve chat history' })
  async getChatHistory(@Param('id') id: string) {
    return this.casesService.getChatHistory(id);
  }

  @Post(':id/advocacy')
  @Roles('AGENT')
  @ApiOperation({ summary: 'Manually apply Advocacy Shield' })
  async applyAdvocacy(@Param('id') id: string) {
    const updatedCase = await this.casesService.triggerAdvocacy(
      id,
      'MANUAL_OVERRIDE',
    );
    if (!updatedCase) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return updatedCase;
  }

  @Post(':id/freeze')
  @Roles('AGENT')
  @ApiOperation({ summary: 'Toggle fee freeze' })
  async toggleFreeze(@Param('id') id: string, @Body('freeze') freeze: boolean) {
    const updatedCase = await this.casesService.toggleFeeFreeze(id, freeze);
    if (!updatedCase) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return updatedCase;
  }

  @Get('admin/roi')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Retrieve ROI statistics' })
  async getROI(@Req() req: Request) {
    return this.casesService.getROIStats(req['orgId'] as string);
  }

  @Get('admin/stats')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Retrieve administrative statistics' })
  async getAdminStats(@Req() req: Request) {
    return this.casesService.getAdminStats(req['orgId'] as string);
  }

  @Get('admin/branding')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Retrieve organization branding' })
  async getBranding(@Req() req: Request) {
    return this.casesService.getOrganizationBranding(req['orgId'] as string);
  }

  @Post('admin/branding')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Update organization branding' })
  async updateBranding(@Req() req: Request, @Body() body: any) {
    return this.casesService.updateOrganizationBranding(
      req['orgId'] as string,
      body,
    );
  }

  @Post(':id/restructure')
  @Roles('AGENT')
  @ApiOperation({ summary: 'Restructure case debt' })
  async restructure(@Param('id') id: string) {
    const result = await this.casesService.restructureDebt(id);
    if (!result) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return result;
  }

  @Delete(':id')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Delete case data' })
  async deleteCase(@Param('id') id: string) {
    return this.casesService.deleteCaseData(id);
  }
}
