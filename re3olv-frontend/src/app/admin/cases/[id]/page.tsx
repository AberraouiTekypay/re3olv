'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ShieldCheck, ShieldAlert, History, MessageSquare, Activity, ArrowLeft, BarChart3, TrendingDown, Landmark, Calculator, Sparkles, PieChart, Wallet, ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface ActionLog {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  sender: 'NOVA' | 'USER' | 'AGENT';
  content: string;
  createdAt: string;
}

interface ExternalDebt {
  id: string;
  creditorName: string;
  amount: number;
  status: 'CURRENT' | 'DELINQUENT';
  type: 'CREDIT_CARD' | 'LOAN' | 'UTILITY';
}

interface Income {
  id: string;
  source: string;
  amount: number;
  date: string;
}

interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
}

interface CaseData {
  id: string;
  borrowerName: string;
  totalAmount: number;
  creditScore: number;
  isVerified: boolean;
  isFeeFrozen: boolean;
  penaltyWaived: number;
  status: string;
  hardshipReason: string | null;
  actionLogs: ActionLog[];
  chatMessages: ChatMessage[];
  externalDebts: ExternalDebt[];
  incomes: Income[];
  expenses: Expense[];
}

export default function CaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'credit'>('overview');
  const [discount, setDiscount] = useState(40);

  useEffect(() => {
    fetchCase();
  }, [id]);

  const fetchCase = async () => {
    try {
      const data = await fetchApi<CaseData>(`/cases/${id}`);
      setCaseData(data);
    } catch (error) {
      toast.error('Failed to fetch case details');
    } finally {
      setLoading(false);
    }
  };

  const toggleFreeze = async () => {
    if (!caseData) return;
    setActionLoading(true);
    try {
      await fetchApi(`/cases/${id}/toggle-freeze`, {
        method: 'POST',
        body: JSON.stringify({ freeze: !caseData.isFeeFrozen }),
      });
      toast.success(caseData.isFeeFrozen ? 'Fees unfrozen' : 'Fees frozen manually');
      fetchCase();
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center font-mono">Loading Case Analysis...</div>;
  if (!caseData) return <div className="p-12 text-center">Case not found.</div>;

  const totalExternalDebt = caseData.externalDebts.reduce((acc, debt) => acc + debt.amount, 0);
  const globalDebt = totalExternalDebt + caseData.totalAmount;
  const consolidatedSettlement = globalDebt * (1 - discount / 100);
  const monthlyConsolidated = consolidatedSettlement / 24;

  const totalIncome = caseData.incomes.reduce((acc, inc) => acc + inc.amount, 0);
  const totalExpenses = caseData.expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const netCashFlow = totalIncome - totalExpenses;
  const entertainmentExpense = caseData.expenses.filter(e => e.category === 'ENTERTAINMENT').reduce((acc, exp) => acc + exp.amount, 0);
  const entertainmentRatio = totalIncome > 0 ? (entertainmentExpense / totalIncome) * 100 : 0;

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft size={16} /> Back to Dashboard
        </Button>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          <Button 
            variant={activeTab === 'overview' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveTab('overview')}
            className="rounded-lg font-bold"
          >
            Resolution Overview
          </Button>
          <Button 
            variant={activeTab === 'credit' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveTab('credit')}
            className="rounded-lg font-bold gap-2"
          >
            <PieChart size={14} /> Credit Intelligence
          </Button>
        </div>
      </div>

      <header className="mb-12 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">{caseData.borrowerName}</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-lg text-slate-500 font-mono uppercase tracking-tighter">{caseData.id}</p>
            {caseData.isVerified && (
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1">
                <ShieldCheck size={12} /> Open Banking Verified
              </span>
            )}
          </div>
        </div>
        <div className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-sm shadow-sm ${
          caseData.status === 'SETTLED' ? 'bg-green-100 text-green-700' : 
          caseData.status === 'RESOLVED' ? 'bg-indigo-100 text-indigo-700' :
          'bg-orange-100 text-orange-700'
        }`}>
          {caseData.status}
        </div>
      </header>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 py-6 px-8">
                <CardTitle className="flex items-center gap-2 text-xl font-black">
                  <MessageSquare className="text-indigo-600" size={20} /> Conversation Transcript
                </CardTitle>
                <CardDescription>Full dialogue history between the borrower and Nova AI.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 max-h-[500px] overflow-y-auto space-y-6">
                {caseData.chatMessages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 italic font-medium">No chat history available.</div>
                ) : (
                  caseData.chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{msg.sender}</span>
                        <span className="text-[10px] text-slate-300 font-mono">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.sender === 'USER' 
                          ? 'bg-white text-slate-800 border border-slate-100 rounded-tr-none' 
                          : 'bg-indigo-600 text-white rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 py-6 px-8">
                <CardTitle className="flex items-center gap-2 text-xl font-black">
                  <History className="text-indigo-600" size={20} /> Agent Action Log
                </CardTitle>
                <CardDescription>Comprehensive audit trail of AI triggers and portal interactions.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="px-8 font-bold text-xs uppercase">Action</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Details</TableHead>
                      <TableHead className="px-8 font-bold text-xs uppercase text-right">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {caseData.actionLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-12 text-slate-400 italic">No activity recorded yet.</TableCell>
                      </TableRow>
                    ) : (
                      caseData.actionLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="px-8 py-4 font-bold text-gray-900">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              log.action === 'NOVA_SHIELD_TRIGGER' ? 'bg-purple-100 text-purple-700' :
                              log.action === 'MAGIC_LINK_VIEW' ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 text-sm text-slate-600">{log.details}</TableCell>
                          <TableCell className="px-8 py-4 text-right text-xs font-mono text-slate-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-0 shadow-xl rounded-3xl bg-indigo-600 text-white overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-white/80 text-sm font-bold uppercase tracking-widest">Manual Override</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-3xl font-black">${caseData.totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-white/60 font-bold uppercase">Current Exposure</p>
                  </div>
                  {caseData.isFeeFrozen ? (
                    <ShieldCheck size={40} className="text-green-400" />
                  ) : (
                    <ShieldAlert size={40} className="text-white/20" />
                  )}
                </div>
                <Button 
                  onClick={toggleFreeze} 
                  disabled={actionLoading}
                  className={`w-full h-12 rounded-2xl font-black uppercase tracking-tighter shadow-lg ${
                    caseData.isFeeFrozen 
                      ? 'bg-white text-indigo-600 hover:bg-slate-100' 
                      : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-900/20'
                  }`}
                >
                  {caseData.isFeeFrozen ? 'Unfreeze Fees' : 'Emergency Freeze'}
                </Button>
              </CardContent>
              <CardFooter className="bg-indigo-700/50 py-4 px-6">
                <p className="text-[10px] font-bold text-white/40 uppercase leading-tight">
                  Warning: Manual overrides bypass AI thresholds and are logged for institutional review.
                </p>
              </CardFooter>
            </Card>

            <Card className="border-0 shadow-xl rounded-3xl bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-50">
                <CardTitle className="text-gray-900 text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Activity size={16} className="text-indigo-600" /> AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {caseData.hardshipReason ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed italic">"{caseData.hardshipReason}"</p>
                    <div className="flex items-center gap-2 text-green-600 font-black text-xs uppercase tracking-tighter bg-green-50 p-3 rounded-xl border border-green-100">
                      <ShieldCheck size={14} /> Shield Active: -${caseData.penaltyWaived}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No AI analysis performed yet. Waiting for borrower interaction.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-slate-50 border-b border-slate-100 py-6 px-8 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black">Financial Health Radar</CardTitle>
                  <CardDescription>Global debt overview and institutional credit scoring.</CardDescription>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl shadow-inner border border-slate-100 flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400">Credit Score</span>
                  <span className={`text-2xl font-black ${caseData.creditScore < 600 ? 'text-red-500' : 'text-green-500'}`}>
                    {caseData.creditScore}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                    <Activity className="mx-auto text-indigo-600 mb-2" size={24} />
                    <p className="text-xs font-bold text-slate-400 uppercase">Debt-to-Income</p>
                    <p className="text-2xl font-black text-slate-900">65%</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                    <TrendingDown className="mx-auto text-red-500 mb-2" size={24} />
                    <p className="text-xs font-bold text-slate-400 uppercase">Global Debt</p>
                    <p className="text-2xl font-black text-slate-900">${globalDebt.toLocaleString()}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                    <Landmark className="mx-auto text-indigo-600 mb-2" size={24} />
                    <p className="text-xs font-bold text-slate-400 uppercase">Creditors</p>
                    <p className="text-2xl font-black text-slate-900">{caseData.externalDebts.length + 1}</p>
                  </div>
                </div>

                <div className="space-y-12">
                  <section>
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                      <Wallet size={20} className="text-indigo-600" /> Cash Flow Analysis (30-Day Snapshot)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                          <div className="flex items-center gap-3">
                            <ArrowUpCircle className="text-green-600" size={24} />
                            <div>
                              <p className="text-[10px] font-black uppercase text-green-700 opacity-60">Verified Income</p>
                              <p className="text-xl font-black text-green-800">${totalIncome.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                          <div className="flex items-center gap-3">
                            <ArrowDownCircle className="text-red-600" size={24} />
                            <div>
                              <p className="text-[10px] font-black uppercase text-red-700 opacity-60">Total Expenses</p>
                              <p className="text-xl font-black text-red-800">${totalExpenses.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl">
                          <div>
                            <p className="text-[10px] font-black uppercase opacity-60">Net Disposable</p>
                            <p className="text-xl font-black">${netCashFlow.toLocaleString()}</p>
                          </div>
                          {netCashFlow < 500 && <AlertCircle className="text-orange-400 animate-pulse" size={24} />}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                        <h4 className="text-xs font-black uppercase text-slate-400 mb-4 flex items-center gap-2">
                          <AlertCircle size={14} className="text-orange-500" /> Institutional Red Flags
                        </h4>
                        <div className="space-y-3">
                          {entertainmentRatio > 20 && (
                            <div className="p-3 bg-white rounded-xl border-l-4 border-l-orange-500 shadow-sm">
                              <p className="text-xs font-bold text-slate-900">High Non-essential Spend</p>
                              <p className="text-[10px] text-slate-500">{entertainmentRatio.toFixed(1)}% of income spent on entertainment.</p>
                            </div>
                          )}
                          {netCashFlow < caseData.totalAmount * 0.1 && (
                            <div className="p-3 bg-white rounded-xl border-l-4 border-l-red-500 shadow-sm">
                              <p className="text-xs font-bold text-slate-900">Critical Liquidity Risk</p>
                              <p className="text-[10px] text-slate-500">Disposable income insufficient for current resolution plans.</p>
                            </div>
                          )}
                          <div className="p-3 bg-white rounded-xl border-l-4 border-l-green-500 shadow-sm opacity-50">
                            <p className="text-xs font-bold text-slate-900">Income Stability</p>
                            <p className="text-[10px] text-slate-500">Primary salary detected across last 3 cycles.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                      <BarChart3 size={20} className="text-indigo-600" /> External Debt Breakdown
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50">
                          <TableHead className="px-4 font-bold text-xs uppercase">Creditor</TableHead>
                          <TableHead className="font-bold text-xs uppercase">Type</TableHead>
                          <TableHead className="font-bold text-xs uppercase">Exposure</TableHead>
                          <TableHead className="px-4 font-bold text-xs uppercase text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {caseData.externalDebts.map((debt) => (
                          <TableRow key={debt.id}>
                            <TableCell className="px-4 py-4 font-bold text-gray-900">{debt.creditorName}</TableCell>
                            <TableCell className="py-4 text-xs font-medium text-slate-500 uppercase tracking-tighter">{debt.type}</TableCell>
                            <TableCell className="py-4 font-black text-slate-900">${debt.amount.toLocaleString()}</TableCell>
                            <TableCell className="px-4 py-4 text-right">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                debt.status === 'DELINQUENT' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {debt.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </section>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-0 shadow-2xl rounded-3xl bg-indigo-900 text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <CardHeader className="relative z-10">
                <div className="bg-white/10 w-fit p-3 rounded-2xl mb-4">
                  <Calculator size={24} className="text-indigo-300" />
                </div>
                <CardTitle className="text-xl font-black">Consolidation Engine</CardTitle>
                <CardDescription className="text-indigo-300/80 font-medium italic">Model a global settlement package.</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-60">
                    <span>Discount Rate</span>
                    <span>{discount}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="70" 
                    value={discount} 
                    onChange={(e) => setDiscount(parseInt(e.target.value))}
                    className="w-full h-2 bg-indigo-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                  />
                </div>

                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-300 uppercase">Target Debt</span>
                    <span className="text-lg font-black">${globalDebt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/10 pt-4">
                    <span className="text-xs font-bold text-green-400 uppercase italic">Settlement Total</span>
                    <span className="text-2xl font-black text-green-400">${consolidatedSettlement.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/10 pt-4">
                    <span className="text-xs font-bold text-indigo-300 uppercase">Monthly (24 mo.)</span>
                    <span className="text-xl font-black text-white">${monthlyConsolidated.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                  </div>
                </div>

                <Button className="w-full h-14 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black uppercase tracking-tighter shadow-2xl shadow-indigo-950/50 flex gap-2">
                  <Sparkles size={18} /> Generate Offer Letter
                </Button>
              </CardContent>
              <CardFooter className="relative z-10 bg-black/20 py-4 px-6 text-center">
                <p className="text-[10px] font-bold text-indigo-300 uppercase leading-tight">
                  This models a full-portfolio discharge. Final terms subject to creditor bipartite approval.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
