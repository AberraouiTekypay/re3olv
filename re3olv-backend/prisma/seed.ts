import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding...');
  
  const sampleCase = await prisma.case.upsert({
    where: { id: 'c79b6343-4f24-4f0e-b7d6-3e4b78a9c8b2' },
    update: {},
    create: {
      id: 'c79b6343-4f24-4f0e-b7d6-3e4b78a9c8b2',
      totalAmount: 10000.00,
      status: 'OPEN',
    },
  });

  console.log('Created sample case:', sampleCase);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });