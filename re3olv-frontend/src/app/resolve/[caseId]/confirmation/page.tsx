import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Download, CreditCard, Sparkles } from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api-client';

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
  paidAmount?: number;
}

async function getCaseData(caseId: string): Promise<CaseData> {
  return fetchApi<CaseData>(`/cases/${caseId}`, { cache: 'no-store' });
}

async function getSettlementOptions(caseId: string): Promise<SettlementOption[]> {
  return fetchApi<SettlementOption[]>(`/cases/${caseId}/options`, { cache: 'no-store' });
}

export default async function ConfirmationPage({ params }: { params: { caseId: string } }) {
  const { caseId } = await params;
  const caseData = await getCaseData(caseId);

  if (caseData.status === 'SETTLED') {
    return (
      <div className="container mx-auto py-24 px-4 flex justify-center animate-in fade-in duration-1000">
        <Card className="max-w-2xl w-full border-0 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-white to-indigo-50/30">
          <div className="h-3 bg-gradient-to-r from-green-400 to-emerald-500" />
          <CardHeader className="text-center pt-12 pb-6">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-6 rounded-full shadow-inner">
                <CheckCircle2 className="w-20 h-20 text-green-600 animate-pulse" />
              </div>
            </div>
            <CardTitle className="text-4xl font-black tracking-tighter text-gray-900 uppercase italic">Debt Settled</CardTitle>
            <CardDescription className="text-xl font-medium text-slate-600 mt-2">
              Your credit score update has been requested.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8 px-12 text-center space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-indigo-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={64} className="text-indigo-600" />
              </div>
              <p className="text-sm text-indigo-500 uppercase tracking-widest font-black mb-1">Final Settlement Paid</p>
              <p className="text-5xl font-black text-gray-900">${caseData.paidAmount?.toLocaleString()}</p>
              <div className="mt-6 flex items-center justify-center gap-2 text-green-600 font-bold bg-green-50 py-2 px-4 rounded-xl inline-flex">
                <ShieldCheck size={18} /> Financial Freedom Restored
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Reference ID</p>
                <p className="font-mono text-sm font-bold text-slate-700">{caseData.id.slice(0, 12).toUpperCase()}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Status</p>
                <p className="text-sm font-bold text-green-600 uppercase tracking-tighter">Legally Cleared</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-12 pt-0">
            <Button className="w-full h-14 text-xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-200 rounded-2xl gap-3">
              <Download size={24} /> Download Receipt
            </Button>
            <Button variant="ghost" asChild className="w-full h-12 text-lg font-bold text-slate-500 hover:text-indigo-600">
              <Link href="/">
                Return Home <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

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

function ShieldCheck({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
