import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding...');

  // 1. High Penalty Case
  await prisma.case.upsert({
    where: { id: 'case-01-high-penalty' },
    update: {},
    create: {
      id: 'case-01-high-penalty',
      borrowerName: 'Sarah Jenkins',
      principalAmount: 2000.00,
      totalAmount: 2800.00,
      penaltyWaived: 0,
      status: 'OPEN',
    },
  });

  // 2. Partial Payment Case
  await prisma.case.upsert({
    where: { id: 'case-02-partial-pay' },
    update: {},
    create: {
      id: 'case-02-partial-pay',
      borrowerName: 'Marcus Aurelius',
      principalAmount: 1500.00,
      paidAmount: 500.00,
      totalAmount: 1000.00,
      status: 'OPEN',
    },
  });

  // 3. Vague Case
  await prisma.case.upsert({
    where: { id: 'case-03-vague' },
    update: {},
    create: {
      id: 'case-03-vague',
      borrowerName: 'Unknown Debtor',
      principalAmount: 500.00,
      totalAmount: 500.00,
      status: 'OPEN',
    },
  });

  // 4. Large Corporate Case
  await prisma.case.upsert({
    where: { id: 'case-04-large' },
    update: {},
    create: {
      id: 'case-04-large',
      borrowerName: 'Global Corp Inc',
      principalAmount: 25000.00,
      totalAmount: 26500.00,
      status: 'OPEN',
    },
  });

  // 5. Small Consumer Case
  await prisma.case.upsert({
    where: { id: 'case-05-small' },
    update: {},
    create: {
      id: 'case-05-small',
      borrowerName: 'Alice Miller',
      principalAmount: 120.00,
      totalAmount: 150.00,
      status: 'OPEN',
    },
  });

  // 6. Hardship Advocacy Case (Pre-applied)
  await prisma.case.upsert({
    where: { id: 'case-06-hardship' },
    update: {},
    create: {
      id: 'case-06-hardship',
      borrowerName: 'Robert Johnson',
      principalAmount: 4500.00,
      totalAmount: 4500.00,
      isFeeFrozen: true,
      penaltyWaived: 250.00,
      hardshipReason: 'Medical illness verified by Nova.',
      status: 'ADVOCACY',
    },
  });

  // 7. Resolved Case
  await prisma.case.upsert({
    where: { id: 'case-07-resolved' },
    update: {},
    create: {
      id: 'case-07-resolved',
      borrowerName: 'Emily Davis',
      principalAmount: 3200.00,
      totalAmount: 3200.00,
      status: 'RESOLVED',
      selectedOptionId: 'lump-sum',
    },
  });

  // 8. Long-term Installment Case
  await prisma.case.upsert({
    where: { id: 'case-08-long-term' },
    update: {},
    create: {
      id: 'case-08-long-term',
      borrowerName: 'David Wilson',
      principalAmount: 8000.00,
      totalAmount: 8000.00,
      status: 'OPEN',
    },
  });

  // 9. Short-term Installment Case
  await prisma.case.upsert({
    where: { id: 'case-09-short-term' },
    update: {},
    create: {
      id: 'case-09-short-term',
      borrowerName: 'Sophia Clark',
      principalAmount: 3000.00,
      totalAmount: 3000.00,
      status: 'OPEN',
    },
  });

  // 10. High Principal Case
  await prisma.case.upsert({
    where: { id: 'case-10-high-principal' },
    update: {},
    create: {
      id: 'case-10-high-principal',
      borrowerName: 'John Smith',
      principalAmount: 50000.00,
      totalAmount: 50000.00,
      status: 'OPEN',
    },
  });

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