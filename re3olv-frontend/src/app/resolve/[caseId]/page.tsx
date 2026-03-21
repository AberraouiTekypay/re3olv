import React from 'react';
import { Button } from '@/components/ui/button';
import { SettlementSelector } from './SettlementSelector';

interface SettlementOption {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: string;
  savings?: number;
  installments?: number;
  monthlyPayment?: number;
}

interface CaseData {
  id: string;
  totalAmount: number;
  status: string;
}

async function getCaseData(caseId: string): Promise<CaseData> {
  const res = await fetch(`http://localhost:3001/api/cases/${caseId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch case data');
  return res.json();
}

async function getSettlementOptions(caseId: string): Promise<SettlementOption[]> {
  const res = await fetch(`http://localhost:3001/api/cases/${caseId}/options`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch settlement options');
  return res.json();
}

export default async function ResolvePage({ params }: { params: { caseId: string } }) {
  const { caseId } = await params;
  
  try {
    const caseData = await getCaseData(caseId);
    const options = await getSettlementOptions(caseId);

    return (
      <div className="container mx-auto py-12 px-4 max-w-5xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Resolve Your Debt</h1>
          <p className="text-lg text-muted-foreground">
            Case ID: <span className="font-mono text-primary">{caseData.id}</span>
          </p>
          <div className="mt-6 p-6 bg-muted rounded-xl inline-block">
            <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-1">Total Outstanding</p>
            <p className="text-3xl font-bold text-red-500">${caseData.totalAmount.toLocaleString()}</p>
          </div>
        </header>

        <SettlementSelector caseId={caseId} options={options} initialStatus={caseData.status} />

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Need help? Contact our support team at support@re3olv.com</p>
        </footer>
      </div>
    );
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Oops! Something went wrong</h2>
        <p className="text-muted-foreground">We couldn't find the case you're looking for or it's already resolved.</p>
        <Button className="mt-6" asChild>
          <a href="/">Go Back Home</a>
        </Button>
      </div>
    );
  }
}
