import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class ActiveAdaptersDto {
  @IsOptional()
  @IsIn(['Experian', 'Equifax', 'TransUnion'])
  CREDIT?: string;

  @IsOptional()
  @IsIn(['Stripe', 'CMI'])
  PAYMENTS?: string;

  @IsOptional()
  @IsIn(['SAP', 'Oracle'])
  ERP?: string;

  @IsOptional()
  @IsIn(['Plaid', 'OpenBanking'])
  BANKING?: string;
}

class ComplianceRulesDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  maxInterest?: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(2000)
  disclosureText?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency?: string;
}

export class RegionConfigDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ActiveAdaptersDto)
  activeAdapters?: ActiveAdaptersDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ComplianceRulesDto)
  complianceRules?: ComplianceRulesDto;
}

export function isIsoCountryCode(value: string): boolean {
  return /^[A-Z]{2}$/.test(value);
}
