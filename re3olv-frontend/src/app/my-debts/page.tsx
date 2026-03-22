'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ShieldCheck, Wallet, ArrowRight, TrendingDown, Sparkles, Building2, Landmark, PieChart, Activity, AlertCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface ExternalDebt {
  id: string;
  creditorName: string;
  amount: number;
  status: string;
  type: string;
}

interface CaseData {
  id: string;
  borrowerName: string;
  totalAmount: number;
  externalDebts: ExternalDebt[];
}

interface RestructureData {
  totalExposure: number;
  singleMonthlyPayment: number;
  letterOfIntent: string;
  savingsPerMonth: number;
  numDebts: number;
}

export default function MyDebtsPage() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId');
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [restructure, setRestructure] = useState<RestructureData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (caseId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [caseId]);

  const fetchData = async () => {
    try {
      const data = await fetchApi<CaseData>(`/cases/${caseId}`);
      setCaseData(data);
      
      const restData = await fetchApi<RestructureData>(`/cases/restructure/${caseId}`, { method: 'POST' });
      setRestructure(restData);
    } catch (error) {
      toast.error('Failed to retrieve your debt portfolio');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center font-mono">Scanning Global Debt Registry...</div>;
  if (!caseData) return (
    <div className="p-12 text-center max-w-md mx-auto">
      <AlertCircle className="mx-auto text-orange-500 mb-4" size={48} />
      <h2 className="text-2xl font-black mb-2">No Case ID Detected</h2>
      <p className="text-slate-500 mb-6">Please use the secure link sent to you by your institutional advocate.</p>
    </div>
  );

  const totalGlobalDebt = caseData.totalAmount + caseData.externalDebts.reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-indigo-600 text-white p-2 rounded-xl">
            <Building2 size={20} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600">B2B2C Consolidation Engine</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Your Debt Dashboard</h1>
        <p className="text-slate-500 font-medium">Global view of your outstanding liabilities and relief options.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-black">Consolidated Liability Registry</CardTitle>
                  <CardDescription>Aggregate view of all detected institutional debts.</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Global Exposure</p>
                  <p className="text-2xl font-black text-slate-900">${totalGlobalDebt.toLocaleString()}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="px-8 font-bold text-xs uppercase">Creditor</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Type</TableHead>
                    <TableHead className="px-8 font-bold text-xs uppercase text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-indigo-50/30">
                    <TableCell className="px-8 py-4 font-bold text-indigo-700 flex items-center gap-2">
                      <Landmark size={14} /> RE3OLV Partner MFI (Current)
                    </TableCell>
                    <TableCell className="py-4 text-xs font-bold uppercase text-slate-400">Principal Loan</TableCell>
                    <TableCell className="px-8 py-4 text-right font-black text-slate-900">${caseData.totalAmount.toLocaleString()}</TableCell>
                  </TableRow>
                  {caseData.externalDebts.map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell className="px-8 py-4 font-bold text-slate-800">{debt.creditorName}</TableCell>
                      <TableCell className="py-4 text-xs font-bold uppercase text-slate-400">{debt.type}</TableCell>
                      <TableCell className="px-8 py-4 text-right font-black text-slate-900">${debt.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <section>
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <TrendingDown size={20} className="text-indigo-600" /> Debt Snowball Strategy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[caseData, ...caseData.externalDebts].sort((a, b) => {
                const amtA = 'totalAmount' in a ? (a as any).totalAmount : (a as any).amount;
                const amtB = 'totalAmount' in b ? (b as any).totalAmount : (b as any).amount;
                return amtA - amtB;
              }).map((item, idx) => {
                const name = 'borrowerName' in item ? 'RE3OLV Partner' : (item as any).creditorName;
                const amt = 'totalAmount' in item ? (item as any).totalAmount : (item as any).amount;
                return (
                  <div key={idx} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xl shadow-slate-200/50 relative overflow-hidden group hover:border-indigo-200 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="text-6xl font-black italic">#{idx + 1}</span>
                    </div>
                    <p className="text-[10px] font-black text-indigo-600 uppercase mb-1 tracking-widest">Pay Next</p>
                    <h4 className="font-black text-slate-900 mb-1">{name}</h4>
                    <p className="text-2xl font-black text-slate-900">${amt.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase">Snowball Logic: Clear smallest balances first for momentum.</p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-indigo-600 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-slate-900/50 opacity-10" />
            <CardHeader className="relative z-10">
              <div className="bg-white/10 w-fit p-3 rounded-2xl mb-4">
                <Sparkles size={24} className="text-indigo-300" />
              </div>
              <CardTitle className="text-xl font-black">Consolidation Offer</CardTitle>
              <CardDescription className="text-indigo-300 font-medium italic">Partner Bank: 2026-X Portfolio</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-6">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-300 uppercase">Single Monthly Payment</span>
                  <span className="text-2xl font-black text-white">${restructure?.singleMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-4">
                  <span className="text-xs font-bold text-green-400 uppercase italic">Monthly Savings</span>
                  <span className="text-xl font-black text-green-400">+${restructure?.savingsPerMonth.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm font-medium bg-white/5 p-4 rounded-2xl border border-white/10">
                  <ShieldCheck size={18} className="text-green-400" />
                  <span>Restructured APR: 12% Fixed</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium bg-white/5 p-4 rounded-2xl border border-white/10">
                  <Building2 size={18} className="text-indigo-300" />
                  <span>Consolidates {restructure?.numDebts} institutional debts</span>
                </div>
              </div>

              <Button className="w-full h-14 bg-white text-indigo-600 hover:bg-slate-100 rounded-2xl font-black uppercase tracking-tighter shadow-2xl shadow-indigo-950/50 flex gap-2">
                Apply for Consolidation <ArrowRight size={18} />
              </Button>
              <Button 
                variant="outline"
                className="w-full h-12 bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-2xl font-bold gap-2"
                onClick={() => window.open(`http://localhost:3001/api/cases/${caseId}/offer-pdf`, '_blank')}
              >
                <Download size={18} /> Download Official Offer
              </Button>
            </CardContent>
            <CardFooter className="relative z-10 bg-black/20 py-4 px-6">
              <p className="text-[10px] font-bold text-indigo-300 uppercase leading-tight text-center">
                Moving your debts to a single partner bank reduces global defaults and improves your institutional credit score.
              </p>
            </CardFooter>
          </Card>

          <Card className="border-0 shadow-xl rounded-3xl bg-white overflow-hidden border border-slate-100">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-gray-900 text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <PieChart size={16} className="text-indigo-600" /> Portfolio Health
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-black uppercase text-slate-400">
                  <span>Current Liquidity Risk</span>
                  <span className="text-orange-500">Elevated</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full w-[75%]" />
                </div>
                <p className="text-[10px] text-slate-500 italic leading-relaxed">
                  Nova AI Analysis: Consolidating your debt will reduce your debt-to-income ratio by 15% and stabilize your monthly cash flow.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
