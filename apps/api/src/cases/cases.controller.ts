import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  UseGuards,
  Req,
  Delete,
  UseInterceptors,
  UploadedFile,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { CasesService } from './cases.service.js';
import { AdvocacyBrainService } from './advocacy-brain.service.js';
import { LinkService } from './link.service.js';
import { ProviderOrchestratorService } from './provider-orchestrator.service.js';
import { IntegrationOrchestratorService } from './integration-orchestrator.service.js';
import { BorrowerTokenGuard } from './borrower-token.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { PublicRoute, Roles } from '../auth/roles.decorator.js';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import {
  BrandingDto,
  FreezeFeesDto,
  HardshipStoryDto,
  ProviderToggleDto,
  ResolveCaseDto,
  SettleCaseDto,
} from './dto/case-write.dto.js';
import { RegionConfigDto, isIsoCountryCode } from './dto/region-config.dto.js';
import { PublicRequestLimitGuard } from './public-request-limit.guard.js';

@ApiTags('cases')
@ApiBearerAuth()
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
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({
    summary: 'Regional: Update country config (Adapters & Compliance)',
  })
  async updateRegionConfig(
    @Param('countryCode') countryCode: string,
    @Body() body: RegionConfigDto,
  ) {
    const normalizedCountryCode = countryCode.toUpperCase();
    if (!isIsoCountryCode(normalizedCountryCode)) {
      throw new BadRequestException('countryCode must be an ISO alpha-2 code');
    }
    return this.integrationOrchestratorService.updateRegionConfig(
      normalizedCountryCode,
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
    @Body() body: ProviderToggleDto,
  ) {
    return this.providerOrchestratorService.toggleProvider(
      req['orgId'] as string,
      id,
      body.active,
    );
  }

  @Post(':id/nudge')
  @Roles('AGENT')
  @ApiOperation({ summary: 'Prepare a borrower outreach message' })
  async nudgeCase(@Param('id') id: string, @Req() req: Request) {
    const result = await this.casesService.nudgeCase(id, req['orgId'] as string);
    if (!result) throw new NotFoundException('Case not found in your organization');
    return result;
  }

  @Post('upload')
  @Roles('MANAGER')
  @UseGuards(PublicRequestLimitGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0, parts: 1 },
      fileFilter: (_request, file, callback) => {
        const isCsvName = file.originalname.toLowerCase().endsWith('.csv');
        const isCsvType = [
          'text/csv',
          'application/csv',
          'application/vnd.ms-excel',
        ].includes(file.mimetype.toLowerCase());
        if (!isCsvName || !isCsvType) {
          callback(new BadRequestException('Upload must be a CSV file'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Bulk upload cases via CSV' })
  async uploadCases(
    @UploadedFile() file: Express.Multer.File,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: Request,
  ) {
    if (!file?.buffer?.length) throw new BadRequestException('CSV file is required');
    if (!idempotencyKey || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
      throw new BadRequestException('A UUID Idempotency-Key header is required');
    }
    return this.casesService.batchUpload(
      file.buffer,
      req['orgId'] as string,
      file.originalname.replace(/[^\w. -]/g, '_').slice(0, 120),
      idempotencyKey.toLowerCase(),
    );
  }

  @Get(':id')
  @Roles('AGENT', 'MANAGER')
  @ApiOperation({ summary: 'Retrieve specific case details' })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const c = await this.casesService.findOne(id, req['orgId'] as string);
    if (!c) {
      throw new NotFoundException(
        `Case with ID ${id} not found in your organization`,
      );
    }
    const safeCase = Object.fromEntries(
      Object.entries(c).filter(([key]) => key !== 'magicToken' && key !== 'encryptedData'),
    );
    return safeCase;
  }

  @Get(':id/portal')
  @PublicRoute()
  @UseGuards(PublicRequestLimitGuard, BorrowerTokenGuard)
  @ApiOperation({ summary: 'Retrieve borrower portal case details' })
  async getBorrowerPortalCase(@Param('id') id: string) {
    const borrowerCase = await this.casesService.getBorrowerPortalCase(id);
    if (!borrowerCase) throw new NotFoundException('Case not found');
    return borrowerCase;
  }

  @Get(':id/borrower-debts')
  @PublicRoute()
  @UseGuards(PublicRequestLimitGuard, BorrowerTokenGuard)
  @ApiOperation({ summary: 'Retrieve the borrower’s linked debt details' })
  async getBorrowerDebtDetails(@Param('id') id: string) {
    const debts = await this.casesService.getBorrowerDebtDetails(id);
    if (!debts) throw new NotFoundException('Case not found');
    return debts;
  }

  @Get(':id/borrower-branding')
  @PublicRoute()
  @UseGuards(PublicRequestLimitGuard, BorrowerTokenGuard)
  @ApiOperation({ summary: 'Retrieve branding for the borrower’s case' })
  async getBorrowerBranding(@Param('id') id: string) {
    return this.casesService.getBorrowerBranding(id);
  }

  @Post(':id/borrower-restructure')
  @PublicRoute()
  @UseGuards(PublicRequestLimitGuard, BorrowerTokenGuard)
  @ApiOperation({ summary: 'Calculate a borrower debt consolidation proposal' })
  async restructureDebtForBorrower(@Param('id') id: string) {
    const result = await this.casesService.restructureDebtForBorrower(id);
    if (!result) throw new NotFoundException('Case not found');
    return result;
  }

  @Post(':id/magic-link')
  @Roles('AGENT')
  @ApiOperation({ summary: 'Generate a magic link for borrower outreach' })
  async generateMagicLink(@Param('id') id: string, @Req() req: Request) {
    const link = await this.linkService.generateMagicLink(id, req['orgId'] as string);
    if (!link) throw new NotFoundException('Case not found in your organization');
    return link;
  }

  @Post(':id/track')
  @PublicRoute()
  @UseGuards(PublicRequestLimitGuard, BorrowerTokenGuard)
  @ApiOperation({ summary: 'Track borrower view' })
  async trackView(@Param('id') id: string) {
    await this.casesService.trackView(id);
    return { status: 'tracked' };
  }

  @Get(':id/settlement-options')
  @PublicRoute()
  @UseGuards(PublicRequestLimitGuard, BorrowerTokenGuard)
  @ApiOperation({ summary: 'Retrieve available settlement options' })
  async getOptions(@Param('id') id: string) {
    const options = await this.casesService.getSettlementOptions(id);
    if (!options) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return options;
  }

  @Post(':id/resolve')
  @PublicRoute()
  @UseGuards(PublicRequestLimitGuard, BorrowerTokenGuard)
  @ApiOperation({ summary: 'Accept a settlement option' })
  async resolveCase(
    @Param('id') id: string,
    @Body() body: ResolveCaseDto,
  ) {
    const updatedCase = await this.casesService.resolveCase(id, body.optionId);
    if (!updatedCase) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return updatedCase;
  }

  @Post(':id/settle')
  @PublicRoute()
  @UseGuards(PublicRequestLimitGuard, BorrowerTokenGuard)
  @ApiOperation({ summary: 'Settle case manually with custom amount' })
  async settleCase(@Param('id') id: string, @Body() body: SettleCaseDto) {
    const updatedCase = await this.casesService.settleCase(id, body.amount);
    if (!updatedCase) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return updatedCase;
  }

  @Post(':id/hardship')
  @PublicRoute()
  @UseGuards(PublicRequestLimitGuard, BorrowerTokenGuard)
  @ApiOperation({ summary: 'Process borrower hardship story via AI' })
  async processHardship(@Param('id') id: string, @Body() body: HardshipStoryDto) {
    return this.advocacyBrainService.processHardshipStory(id, body.story.trim());
  }

  @Get(':id/chat')
  @PublicRoute()
  @UseGuards(PublicRequestLimitGuard, BorrowerTokenGuard)
  @ApiOperation({ summary: 'Retrieve chat history' })
  async getChatHistory(@Param('id') id: string) {
    return this.casesService.getChatHistory(id);
  }

  @Post(':id/advocacy')
  @Roles('AGENT')
  @ApiOperation({ summary: 'Manually apply Advocacy Shield' })
  async applyAdvocacy(@Param('id') id: string, @Req() req: Request) {
    await this.assertTenantCase(id, req['orgId'] as string);
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
  async toggleFreeze(
    @Param('id') id: string,
    @Body() body: FreezeFeesDto,
    @Req() req: Request,
  ) {
    await this.assertTenantCase(id, req['orgId'] as string);
    const updatedCase = await this.casesService.toggleFeeFreeze(id, body.freeze);
    if (!updatedCase) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return updatedCase;
  }

  @Get('admin/roi')
  @Roles('AGENT', 'MANAGER')
  @ApiOperation({ summary: 'Retrieve ROI statistics' })
  async getROI(@Req() req: Request) {
    return this.casesService.getROIStats(req['orgId'] as string);
  }

  @Get('admin/stats')
  @Roles('AGENT', 'MANAGER')
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
  async updateBranding(@Req() req: Request, @Body() body: BrandingDto) {
    return this.casesService.updateOrganizationBranding(
      req['orgId'] as string,
      body,
    );
  }

  @Post(':id/restructure')
  @Roles('AGENT')
  @ApiOperation({ summary: 'Restructure case debt' })
  async restructure(@Param('id') id: string, @Req() req: Request) {
    const result = await this.casesService.restructureDebt(
      id,
      req['orgId'] as string,
    );
    if (!result) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return result;
  }

  @Delete(':id')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Delete case data' })
  async deleteCase(@Param('id') id: string, @Req() req: Request) {
    return this.casesService.deleteCaseData(id, req['orgId'] as string);
  }

  private async assertTenantCase(caseId: string, organizationId: string) {
    const found = await this.casesService.findOne(caseId, organizationId);
    if (!found) throw new NotFoundException('Case not found in your organization');
  }
}
