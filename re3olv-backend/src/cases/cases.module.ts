import { Module } from '@nestjs/common';
import { CasesService } from './cases.service.js';
import { CasesController } from './cases.controller.js';
import { AdvocacyBrainService } from './advocacy-brain.service.js';
import { LinkService } from './link.service.js';

@Module({
  providers: [CasesService, AdvocacyBrainService, LinkService],
  controllers: [CasesController],
  exports: [CasesService, AdvocacyBrainService, LinkService],
})
export class CasesModule {}
