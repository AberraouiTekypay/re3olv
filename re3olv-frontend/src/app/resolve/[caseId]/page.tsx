import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BadgeCheck, CreditCard, CalendarDays } from 'lucide-react';

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {options.map((option) => (
            <Card key={option.id} className={`flex flex-col border-2 transition-all hover:border-primary/50 ${option.id === 'lump-sum' ? 'border-primary shadow-lg scale-105' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  {option.id === 'lump-sum' && (
                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <BadgeCheck size={14} /> Recommended
                    </div>
                  )}
                  {option.id === 'short-term' && <CreditCard className="text-muted-foreground" size={20} />}
                  {option.id === 'long-term' && <CalendarDays className="text-muted-foreground" size={20} />}
                </div>
                <CardTitle className="text-xl">{option.name}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col items-center justify-center py-6">
                <p className="text-3xl font-bold">${option.amount.toLocaleString()}</p>
                {option.monthlyPayment && (
                  <p className="text-sm text-muted-foreground mt-1">
                    ${option.monthlyPayment.toFixed(2)} / month for {option.installments} months
                  </p>
                )}
                {option.savings && (
                  <p className="text-sm text-green-600 font-semibold mt-2">
                    Save ${option.savings.toLocaleString()}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={option.id === 'lump-sum' ? 'default' : 'outline'}>
                  Select Plan
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

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
