import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';

export class ResolveCaseDto {
  @IsString()
  @IsIn(['lump-sum', 'short-term', 'long-term'])
  optionId!: string;
}

export class SettleCaseDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100_000_000)
  amount!: number;
}

export class HardshipStoryDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  story!: string;
}

export class ProviderToggleDto {
  @IsBoolean()
  active!: boolean;
}

export class FreezeFeesDto {
  @IsBoolean()
  freeze!: boolean;
}

export class BrandingDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  legalName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  logoUrl?: string | null;

  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  primaryColor?: string;

  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  secondaryColor?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? null : value,
  )
  @IsEmail()
  @MaxLength(254)
  supportEmail?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  regulatoryDisclaimer?: string | null;
}
