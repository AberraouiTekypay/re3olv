import { Module } from '@nestjs/common';
import { CasesService } from './cases.service.js';
import { CasesController } from './cases.controller.js';
import { AdvocacyBrainService } from './advocacy-brain.service.js';
import { LinkService } from './link.service.js';
import { EuropeanRegisterService } from './european-register.service.js';
import { ProviderOrchestratorService } from './provider-orchestrator.service.js';
import { IntegrationOrchestratorService } from './integration-orchestrator.service.js';
import { EncryptionService } from './encryption.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { BorrowerTokenGuard } from './borrower-token.guard.js';
import { DatabaseModule } from '../database/database.module.js';
import { PublicRequestLimitGuard } from './public-request-limit.guard.js';
import { PublicRequestLimitGuard } from './public-request-limit.guard.js';

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [
    CasesService,
    AdvocacyBrainService,
    LinkService,
    EuropeanRegisterService,
    ProviderOrchestratorService,
    IntegrationOrchestratorService,
    EncryptionService,
    BorrowerTokenGuard,
    PublicRequestLimitGuard,
    PublicRequestLimitGuard,
  ],
  controllers: [CasesController],
  exports: [
    CasesService,
    AdvocacyBrainService,
    LinkService,
    EuropeanRegisterService,
    ProviderOrchestratorService,
    IntegrationOrchestratorService,
    EncryptionService,
  ],
})
export class CasesModule {}
