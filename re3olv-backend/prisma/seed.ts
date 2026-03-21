import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding...');

  // 0. Create Default Org
  const defaultOrg = await prisma.organization.upsert({
    where: { id: 'default-org' },
    update: {},
    create: {
      id: 'default-org',
      name: 'RE3OLV Default MFI',
    },
  });

  // 1. High Penalty Case
  await prisma.case.upsert({
    where: { id: 'case-01-high-penalty' },
    update: { organizationId: 'default-org' },
    create: {
      id: 'case-01-high-penalty',
      borrowerName: 'Sarah Jenkins',
      principalAmount: 2000.00,
      totalAmount: 2800.00,
      penaltyWaived: 0,
      status: 'OPEN',
      organizationId: 'default-org',
    },
  });

  // 2. Partial Payment Case
  await prisma.case.upsert({
    where: { id: 'case-02-partial-pay' },
    update: { organizationId: 'default-org' },
    create: {
      id: 'case-02-partial-pay',
      borrowerName: 'Marcus Aurelius',
      principalAmount: 1500.00,
      paidAmount: 500.00,
      totalAmount: 1000.00,
      status: 'OPEN',
      organizationId: 'default-org',
    },
  });

  // 3. Vague Case
  await prisma.case.upsert({
    where: { id: 'case-03-vague' },
    update: { organizationId: 'default-org' },
    create: {
      id: 'case-03-vague',
      borrowerName: 'Unknown Debtor',
      principalAmount: 500.00,
      totalAmount: 500.00,
      status: 'OPEN',
      organizationId: 'default-org',
    },
  });

  // 4. Large Corporate Case
  await prisma.case.upsert({
    where: { id: 'case-04-large' },
    update: { organizationId: 'default-org' },
    create: {
      id: 'case-04-large',
      borrowerName: 'Global Corp Inc',
      principalAmount: 25000.00,
      totalAmount: 26500.00,
      status: 'OPEN',
      organizationId: 'default-org',
    },
  });

  // 5. Small Consumer Case
  await prisma.case.upsert({
    where: { id: 'case-05-small' },
    update: { organizationId: 'default-org' },
    create: {
      id: 'case-05-small',
      borrowerName: 'Alice Miller',
      principalAmount: 120.00,
      totalAmount: 150.00,
      status: 'OPEN',
      organizationId: 'default-org',
    },
  });

  // 6. Hardship Advocacy Case (Pre-applied)
  const robertCase = await prisma.case.upsert({
    where: { id: 'case-06-hardship' },
    update: { 
      organizationId: 'default-org',
      isVerified: true,
    },
    create: {
      id: 'case-06-hardship',
      borrowerName: 'Robert Johnson',
      principalAmount: 4500.00,
      totalAmount: 4500.00,
      creditScore: 580,
      isVerified: true,
      isFeeFrozen: true,
      penaltyWaived: 250.00,
      hardshipReason: 'Medical illness verified by Nova.',
      status: 'ADVOCACY',
      organizationId: 'default-org',
    },
  });

  // Mock Income for Robert
  await prisma.income.upsert({
    where: { id: 'income-01' },
    update: {},
    create: {
      id: 'income-01',
      caseId: robertCase.id,
      source: 'Primary Employment',
      amount: 2200.00,
      date: new Date(),
    },
  });

  // Mock Expenses for Robert
  const expenseCategories = [
    { cat: 'HOUSING', amt: 1200 },
    { cat: 'FOOD', amt: 400 },
    { cat: 'TRANSPORT', amt: 300 },
    { cat: 'ENTERTAINMENT', amt: 500 }, // High non-essential
    { cat: 'OTHER', amt: 200 },
  ];

  for (let i = 0; i < expenseCategories.length; i++) {
    await prisma.expense.upsert({
      where: { id: `expense-robert-${i}` },
      update: {},
      create: {
        id: `expense-robert-${i}`,
        caseId: robertCase.id,
        category: expenseCategories[i].cat,
        amount: expenseCategories[i].amt,
        date: new Date(),
      },
    });
  }

  // External debts for Robert
  await prisma.externalDebt.upsert({
    where: { id: 'ext-debt-01' },
    update: {},
    create: {
      id: 'ext-debt-01',
      caseId: robertCase.id,
      creditorName: 'QuickPay Loans',
      amount: 1200.00,
      status: 'DELINQUENT',
      type: 'LOAN',
    },
  });

  await prisma.externalDebt.upsert({
    where: { id: 'ext-debt-02' },
    update: {},
    create: {
      id: 'ext-debt-02',
      caseId: robertCase.id,
      creditorName: 'City Power & Water',
      amount: 450.00,
      status: 'DELINQUENT',
      type: 'UTILITY',
    },
  });

  await prisma.externalDebt.upsert({
    where: { id: 'ext-debt-03' },
    update: {},
    create: {
      id: 'ext-debt-03',
      caseId: robertCase.id,
      creditorName: 'Capital Card',
      amount: 6300.00,
      status: 'CURRENT',
      type: 'CREDIT_CARD',
    },
  });

  // 7. Resolved Case
  await prisma.case.upsert({
    where: { id: 'case-07-resolved' },
    update: { organizationId: 'default-org' },
    create: {
      id: 'case-07-resolved',
      borrowerName: 'Emily Davis',
      principalAmount: 3200.00,
      totalAmount: 3200.00,
      status: 'RESOLVED',
      selectedOptionId: 'lump-sum',
      organizationId: 'default-org',
    },
  });

  // 8. Long-term Installment Case
  await prisma.case.upsert({
    where: { id: 'case-08-long-term' },
    update: { organizationId: 'default-org' },
    create: {
      id: 'case-08-long-term',
      borrowerName: 'David Wilson',
      principalAmount: 8000.00,
      totalAmount: 8000.00,
      status: 'OPEN',
      organizationId: 'default-org',
    },
  });

  // 9. Short-term Installment Case
  await prisma.case.upsert({
    where: { id: 'case-09-short-term' },
    update: { organizationId: 'default-org' },
    create: {
      id: 'case-09-short-term',
      borrowerName: 'Sophia Clark',
      principalAmount: 3000.00,
      totalAmount: 3000.00,
      status: 'OPEN',
      organizationId: 'default-org',
    },
  });

  // 10. High Principal Case
  await prisma.case.upsert({
    where: { id: 'case-10-high-principal' },
    update: { organizationId: 'default-org' },
    create: {
      id: 'case-10-high-principal',
      borrowerName: 'John Smith',
      principalAmount: 50000.00,
      totalAmount: 50000.00,
      status: 'OPEN',
      organizationId: 'default-org',
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