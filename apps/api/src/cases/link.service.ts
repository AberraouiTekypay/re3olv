import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { randomBytes } from 'crypto';

@Injectable()
export class LinkService {
  private prisma: PrismaClient;

  constructor() {
    const adapter = new PrismaBetterSqlite3({
      url: 'file:./dev.db',
    });
    this.prisma = new PrismaClient({ adapter });
  }

  async generateMagicLink(caseId: string) {
    const token = randomBytes(16).toString('hex');
    await this.prisma.case.update({
      where: { id: caseId },
      data: {
        magicToken: token,
        magicLinkCreatedAt: new Date(),
      },
    });
    return {
      token,
      url: `http://localhost:3000/resolve/${caseId}?token=${token}`,
    };
  }

  async validateToken(caseId: string, token: string) {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
    });
    return caseData?.magicToken === token;
  }
}
