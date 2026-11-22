import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { randomBytes, timingSafeEqual } from 'crypto';
import { getWebAppUrl } from '../common/public-url.js';
import { hashMagicToken } from './magic-token.js';

@Injectable()
export class LinkService {
  private prisma: PrismaClient;

  constructor() {
    const adapter = new PrismaBetterSqlite3({
      url: 'file:./dev.db',
    });
    this.prisma = new PrismaClient({ adapter });
  }

  async generateMagicLink(caseId: string, organizationId: string) {
    const token = randomBytes(32).toString('hex');
    const updated = await this.prisma.case.updateMany({
      where: { id: caseId, organizationId },
      data: {
        magicToken: hashMagicToken(token).toString('hex'),
        magicLinkCreatedAt: new Date(),
      },
    });
    if (updated.count !== 1) return null;
    const url = new URL(`/resolve/${encodeURIComponent(caseId)}`, `${getWebAppUrl()}/`);
    url.searchParams.set('token', token);
    return { url: url.toString() };
  }

  async validateToken(caseId: string, token: string) {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
    });
    const validForMs = 7 * 24 * 60 * 60 * 1000;
    const ageMs = caseData?.magicLinkCreatedAt
      ? Date.now() - caseData.magicLinkCreatedAt.getTime()
      : -1;
    if (!caseData?.magicToken || !token || ageMs < 0 || ageMs > validForMs) {
      return false;
    }
    const storedHash = Buffer.from(caseData.magicToken, 'hex');
    const providedHash = hashMagicToken(token);
    return storedHash.length === providedHash.length &&
      timingSafeEqual(storedHash, providedHash);
  }
}
