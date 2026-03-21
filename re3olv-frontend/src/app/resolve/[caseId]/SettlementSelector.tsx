'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BadgeCheck, CreditCard, CalendarDays, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  React.useEffect(() => {
    if (initialStatus === 'RESOLVED') {
      router.replace(`/resolve/${caseId}/confirmation`);
    }
  }, [initialStatus, caseId, router]);

  const handleSelectPlan = async (optionId: string) => {
    setLoading(optionId);
    try {
      const res = await fetch(`http://localhost:3001/api/cases/${caseId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });

      if (!res.ok) {
        throw new Error('Failed to resolve case');
      }

      router.push(`/resolve/${caseId}/confirmation`);
    } catch (error) {
      console.error(error);
      alert('An error occurred while selecting the plan. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  if (initialStatus === 'RESOLVED') {
    return null;
  }

  return (
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
            <Button 
              className="w-full" 
              variant={option.id === 'lump-sum' ? 'default' : 'outline'}
              onClick={() => handleSelectPlan(option.id)}
              disabled={loading !== null}
            >
              {loading === option.id ? 'Processing...' : 'Select Plan'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}