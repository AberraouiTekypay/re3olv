import { Module } from '@nestjs/common';
import { CasesService } from './cases.service.js';
import { CasesController } from './cases.controller.js';

@Module({
  providers: [CasesService],
  controllers: [CasesController],
})
export class CasesModule {}
