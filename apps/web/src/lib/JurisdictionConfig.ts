export type RegionCode = 'za' | 'ma' | 'fr' | 'es';

export interface RegionConfig {
  name: string;
  currency: string;
  locale: string;
  interestRateCap: number; // Annual max interest rate
  legalStrings: {
    footer: string;
    disclosure: string;
    coolingOff?: string;
  };
}

export const JURISDICTION_CONFIG: Record<RegionCode, RegionConfig> = {
  za: {
    name: 'South Africa',
    currency: 'ZAR',
    locale: 'en-ZA',
    interestRateCap: 0.27, // 27% (NCA max)
    legalStrings: {
      footer: 'Registered Credit Provider NCRCP12345 | POPIA Compliant',
      disclosure: 'NCA Section 129 Pre-enforcement Notice Disclosure.',
    }
  },
  fr: {
    name: 'France',
    currency: 'EUR',
    locale: 'fr-FR',
    interestRateCap: 0.21, // 21% (Usury rate)
    legalStrings: {
      footer: 'Conformité RGPD / CNIL No. 987654321',
      disclosure: 'Information précontractuelle standardisée européenne (IPSE).',
      coolingOff: 'Loi Hamon: Droit de rétractation de 14 jours (ou 24h cooling-off spécifique CCD2).',
    }
  },
  es: {
    name: 'España',
    currency: 'EUR',
    locale: 'es-ES',
    interestRateCap: 0.24, // 24% (Usury jurisprudence)
    legalStrings: {
      footer: 'Regulado por el Banco de España',
      disclosure: 'Ley de transparencia y protección del cliente de servicios bancarios.',
    }
  },
  ma: {
    name: 'Morocco',
    currency: 'MAD',
    locale: 'fr-MA',
    interestRateCap: 0.18, // 18% (Central Bank BAM)
    legalStrings: {
      footer: 'Conformité CNDP Loi 09-08',
      disclosure: 'Informations légales et protection du consommateur.',
    }
  }
};
