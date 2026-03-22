export type Region = 'za' | 'ma' | 'fr' | 'es';

export interface RegionalConfig {
  currency: string;
  locale: string;
  languages: string[];
  compliance: string[];
  fees?: {
    application: number;
    adminCap: number;
  };
}

export const JURISDICTIONS: Record<Region, RegionalConfig> = {
  za: {
    currency: 'ZAR',
    locale: 'en-ZA',
    languages: ['en', 'af', 'zu'],
    compliance: ['NCR', 'POPIA', 'Section 129'],
    fees: {
      application: 50,
      adminCap: 300,
    },
  },
  ma: {
    currency: 'MAD',
    locale: 'fr-MA',
    languages: ['fr', 'ar'],
    compliance: ['CNDP'],
  },
  fr: {
    currency: 'EUR',
    locale: 'fr-FR',
    languages: ['fr'],
    compliance: ['GDPR', 'CNIL'],
  },
  es: {
    currency: 'EUR',
    locale: 'es-ES',
    languages: ['es'],
    compliance: ['GDPR', 'Bank of Spain Transparency'],
  },
};

export class JurisdictionEngine {
  constructor(private region: Region) {}

  getConfig(): RegionalConfig {
    return JURISDICTIONS[this.region];
  }

  formatCurrency(amount: number): string {
    const config = this.getConfig();
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
    }).format(amount);
  }

  calculateZAComplianceFees(originalAmount: number): number {
    if (this.region !== 'za') return 0;
    const { fees } = JURISDICTIONS.za;
    // Example logic: Base fee + capped admin fee
    const adminFee = Math.min(originalAmount * 0.1, fees!.adminCap);
    return fees!.application + adminFee;
  }
}
