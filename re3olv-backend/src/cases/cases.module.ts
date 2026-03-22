import { Module } from '@nestjs/common';
import { CasesService } from './cases.service.js';
import { CasesController } from './cases.controller.js';
import { AdvocacyBrainService } from './advocacy-brain.service.js';
import { LinkService } from './link.service.js';
import { EuropeanRegisterService } from './european-register.service.js';

@Module({
  providers: [CasesService, AdvocacyBrainService, LinkService, EuropeanRegisterService],
  controllers: [CasesController],
  exports: [CasesService, AdvocacyBrainService, LinkService, EuropeanRegisterService],
})
export class CasesModule {}
