import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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
  selectedOptionId?: string;
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

export default async function ConfirmationPage({ params }: { params: { caseId: string } }) {
  const { caseId } = await params;
  const caseData = await getCaseData(caseId);

  if (caseData.status !== 'RESOLVED' || !caseData.selectedOptionId) {
    redirect(`/resolve/${caseId}`);
  }

  const options = await getSettlementOptions(caseId);
  const selectedOption = options.find((opt) => opt.id === caseData.selectedOptionId);

  if (!selectedOption) {
    redirect(`/resolve/${caseId}`);
  }

  const dueDate = new Date();
  if (selectedOption.id === 'lump-sum') {
    dueDate.setDate(dueDate.getDate() + 7);
  } else {
    dueDate.setDate(dueDate.getDate() + 30);
  }

  const formattedDate = dueDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const paymentAmount = selectedOption.monthlyPayment || selectedOption.amount;

  return (
    <div className="container mx-auto py-24 px-4 flex justify-center">
      <Card className="max-w-md w-full border-t-8 border-t-green-500 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl font-bold">Plan Confirmed</CardTitle>
          <CardDescription className="text-lg">
            Your resolution plan has been successfully activated.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center space-y-4">
          <div className="bg-muted p-6 rounded-lg">
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold mb-2">First Payment Amount</p>
            <p className="text-4xl font-bold text-primary">${paymentAmount.toLocaleString()}</p>
          </div>
          <div className="pt-4">
            <p className="text-lg">
              Your first payment is due on <span className="font-bold">{formattedDate}</span>.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full h-12 text-lg">
            <Link href="/">
              Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            A confirmation email with the payment link has been sent to your registered address.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
