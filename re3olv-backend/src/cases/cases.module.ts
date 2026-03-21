import { Module } from '@nestjs/common';
import { CasesService } from './cases.service.js';
import { CasesController } from './cases.controller.js';
import { AdvocacyBrainService } from './advocacy-brain.service.js';

@Module({
  providers: [CasesService, AdvocacyBrainService],
  controllers: [CasesController],
  exports: [CasesService, AdvocacyBrainService],
})
export class CasesModule {}
