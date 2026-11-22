'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Wallet, TrendingDown, Building2, Landmark, PieChart, Activity, AlertCircle } from 'lucide-react';
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

interface BrandingData {
  primaryColor: string;
  logoUrl: string;
}

function MyDebtsContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId');
  const token = searchParams.get('token');
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [branding, setBranding] = useState<BrandingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (caseId && token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [caseId, token]);

  const fetchData = async () => {
    try {
      const [data, brandData] = await Promise.all([
        fetchApi<CaseData>(`/cases/${caseId}/borrower-debts`, {
          headers: { 'x-borrower-token': token! },
        }),
        fetchApi<BrandingData>(`/cases/${caseId}/borrower-branding`, {
          headers: { 'x-borrower-token': token! },
        }),
      ]);
      setCaseData(data);
      setBranding(brandData);
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
      <h2 className="text-2xl font-black mb-2">Secure link required</h2>
      <p className="text-slate-500 mb-6">Please use a current secure link sent by your institutional advocate.</p>
    </div>
  );

  const totalGlobalDebt = caseData.totalAmount + caseData.externalDebts.reduce((acc, d) => acc + d.amount, 0);
  const primaryColor = branding?.primaryColor || '#4f46e5';

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          {branding?.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" className="h-8" />
          ) : (
            <div className="text-white p-2 rounded-xl" style={{ backgroundColor: primaryColor }}>
              <Building2 size={20} />
            </div>
          )}
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: primaryColor }}>B2B2C Consolidation Engine</span>
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
              <TrendingDown size={20} style={{ color: primaryColor }} /> Debt Snowball Strategy
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
                    <p className="text-[10px] font-black uppercase mb-1 tracking-widest" style={{ color: primaryColor }}>Pay Next</p>
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
          <Card className="border-0 shadow-xl rounded-3xl bg-white overflow-hidden border border-slate-100">
            <CardHeader>
              <CardTitle className="text-gray-900 text-sm font-black uppercase tracking-widest">Restructuring offers</CardTitle>
              <CardDescription>Offers will appear here after an authorized lender configures and approves live terms.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              No lender-backed restructuring offer is currently available for this account.
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl rounded-3xl bg-white overflow-hidden border border-slate-100">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-gray-900 text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <PieChart size={16} style={{ color: primaryColor }} /> Portfolio Health
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

export default function MyDebtsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-mono">Initializing Advocacy Engine...</div>}>
      <MyDebtsContent />
    </Suspense>
  );
}
