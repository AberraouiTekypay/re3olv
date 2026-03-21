import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { CasesService } from './cases.service.js';

@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

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
}
