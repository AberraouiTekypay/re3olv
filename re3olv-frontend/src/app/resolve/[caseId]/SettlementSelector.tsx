'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BadgeCheck, CreditCard, CalendarDays, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api-client';
import { toast } from 'sonner';

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

export function SettlementSelector({ caseId, options, initialStatus }: { caseId: string, options: SettlementOption[], initialStatus: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (initialStatus === 'RESOLVED') {
      // If already resolved, we show the plans but allow payment
    }
    if (initialStatus === 'SETTLED') {
      router.replace(`/resolve/${caseId}/confirmation`);
    }
  }, [initialStatus, caseId, router]);

  const handleSelectPlan = async (optionId: string) => {
    setLoading(optionId);
    try {
      await fetchApi(`/cases/${caseId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ optionId }),
      });
      toast.success('Plan activated. You can now proceed to payment.');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Failed to activate plan.');
    } finally {
      setLoading(null);
    }
  };

  const handlePayNow = async (amount: number) => {
    setIsPaying(true);
    // Task 1: 2-second mock delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      await fetchApi(`/cases/${caseId}/settle`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
      toast.success('Payment successful! Redirecting...');
      router.push(`/resolve/${caseId}/confirmation`);
    } catch (error) {
      console.error(error);
      toast.error('Payment failed. Please try again.');
      setIsPaying(false);
    }
  };

  if (initialStatus === 'SETTLED') {
    return null;
  }

  return (
    <div className="relative">
      {isPaying && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md animate-in fade-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse" />
            <Loader2 className="w-24 h-24 text-indigo-600 animate-spin relative z-10" />
          </div>
          <h2 className="mt-8 text-3xl font-black tracking-tighter text-gray-900 uppercase italic">Processing Payment...</h2>
          <p className="mt-2 text-slate-500 font-medium">Nova is securing your financial freedom.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {options.map((option) => {
          const isSelected = initialStatus === 'RESOLVED' && options.find(o => o.id === option.id); // This is a bit simplified, ideally we'd have the actual selected ID
          // Let's check if this is the actual selected one if status is RESOLVED
          // Since we don't pass the selectedOptionId in props, we'll assume the user is selecting one now or it was the one they just clicked
          
          return (
            <Card key={option.id} className={`flex flex-col border-2 transition-all hover:border-primary/50 ${option.id === 'lump-sum' ? 'border-primary shadow-lg' : ''}`}>
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
              <CardFooter className="flex flex-col gap-2">
                {initialStatus === 'OPEN' || initialStatus === 'ADVOCACY' ? (
                  <Button 
                    className="w-full" 
                    variant={option.id === 'lump-sum' ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(option.id)}
                    disabled={loading !== null}
                  >
                    {loading === option.id ? 'Processing...' : 'Select Plan'}
                  </Button>
                ) : (
                  <div className="w-full space-y-2">
                    <div className="bg-indigo-50 text-indigo-700 p-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 mb-2">
                      <Sparkles size={14} /> Plan Active
                    </div>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-bold shadow-lg shadow-green-100" 
                      onClick={() => handlePayNow(option.monthlyPayment || option.amount)}
                      disabled={isPaying}
                    >
                      <CreditCard className="mr-2" /> Pay Now
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
