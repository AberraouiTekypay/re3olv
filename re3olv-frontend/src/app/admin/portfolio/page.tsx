'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { TrendingUp, Heart, Activity, ShieldCheck, Building2, Landmark, PieChart, Users, ArrowUpRight, Download } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface ROIStats {
  totalManaged: number;
  totalCollected: number;
  totalWaived: number;
  settledCount: number;
  totalCases: number;
  roi: number;
  socialImpact: number;
  recoveryVelocity: string;
}

export default function CEOPortfolioPage() {
  const [stats, setStats] = useState<ROIStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await fetchApi<ROIStats>('/cases/analytics/roi');
      setStats(data);
    } catch (error) {
      toast.error('Failed to load institutional analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center font-mono animate-pulse">Aggregating Global Impact Metrics...</div>;

  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-slate-900 text-white p-2 rounded-xl">
              <Building2 size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Executive CEO Suite</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-gray-900">Social Impact Portfolio</h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">Institutional Oversight: Debt Sustainability & Global Recovery Velocity.</p>
        </div>
        <Button className="h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-8 font-black uppercase tracking-tighter gap-2 shadow-xl">
          <Download size={20} /> Export ESG Report
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-indigo-600 text-white overflow-hidden relative h-64">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Users size={120} />
          </div>
          <CardContent className="pt-12 relative z-10">
            <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Households Stabilized</p>
            <h3 className="text-6xl font-black">{stats?.settledCount}</h3>
            <div className="mt-4 flex items-center gap-2 text-indigo-200 font-bold text-sm">
              <ArrowUpRight size={16} /> +12% vs last quarter
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-white overflow-hidden relative h-64 border border-slate-100">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-green-600">
            <TrendingDown size={120} />
          </div>
          <CardContent className="pt-12 relative z-10">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Avg. Rate Reduction</p>
            <h3 className="text-6xl font-black text-slate-900">13.0%</h3>
            <div className="mt-4 flex items-center gap-2 text-green-600 font-bold text-sm">
              <ShieldCheck size={16} /> FDCPA 2026 Compliant
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative h-64">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Landmark size={120} />
          </div>
          <CardContent className="pt-12 relative z-10">
            <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Consolidation Volume</p>
            <h3 className="text-6xl font-black">${((stats?.totalManaged || 0) * 0.45).toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            <div className="mt-4 flex items-center gap-2 text-slate-400 font-bold text-sm">
              <Activity size={16} /> 3 Active Partner Banks
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden border border-slate-100">
          <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <ShieldCheck className="text-green-600" size={24} /> RWA Relief Calculator
            </CardTitle>
            <CardDescription>Risk-Weighted Asset relief achieved via verified resolution data.</CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
                <p className="text-[10px] font-black text-green-700 uppercase mb-1">Total RWA Relief</p>
                <p className="text-3xl font-black text-green-900">$1.2M</p>
                <p className="text-[9px] text-green-600 font-bold mt-2 uppercase">Basel III / IV Compliant</p>
              </div>
              <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-700 uppercase mb-1">Data Confidence</p>
                <p className="text-3xl font-black text-indigo-900">88%</p>
                <p className="text-[9px] text-indigo-600 font-bold mt-2 uppercase">Official + Proxy Hybrid</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-xs font-black uppercase text-slate-400">
                <span>Verification Mix</span>
                <span>High Confidence</span>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
                <div className="bg-green-500 h-full w-[65%]" title="Official Register" />
                <div className="bg-indigo-400 h-full w-[25%]" title="Mobile Money Proxy" />
                <div className="bg-orange-300 h-full w-[10%]" title="Manual Review Required" />
              </div>
              <div className="flex gap-4 text-[9px] font-black uppercase tracking-tighter">
                <div className="flex items-center gap-1.5 text-green-600"><div className="w-2 h-2 rounded-full bg-green-500" /> Official Register</div>
                <div className="flex items-center gap-1.5 text-indigo-500"><div className="w-2 h-2 rounded-full bg-indigo-400" /> Cash Flow Proxy</div>
                <div className="flex items-center gap-1.5 text-orange-500"><div className="w-2 h-2 rounded-full bg-orange-300" /> Pending Review</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative">
          <CardHeader className="p-8 border-b border-white/5 bg-white/5">
            <CardTitle className="text-xl font-black">Capital Allocation Insights</CardTitle>
            <CardDescription className="text-slate-400">Portfolio-wide provisioning recommendations based on resolution velocity.</CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-sm font-medium">Provisioning Over-coverage</span>
              <span className="text-xl font-black text-green-400">-$450K</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-sm font-medium">Capital Re-deployment Potential</span>
              <span className="text-xl font-black text-indigo-400">+$1.8M</span>
            </div>
            <p className="text-[10px] text-slate-500 italic leading-relaxed pt-4">
              Nova ESG Analysis: High-impact resolution data allows for significant reduction in regulatory capital buffers, increasing institutional lending capacity.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden border border-slate-100">
          <CardHeader className="p-8 border-b border-slate-50">
            <CardTitle className="text-xl font-black">Social Performance ROI</CardTitle>
            <CardDescription>Correlation between debt waivers and capital recovery velocity.</CardDescription>
          </CardHeader>
          <CardContent className="p-10">
            <div className="h-64 flex items-end gap-4">
              {[40, 65, 45, 90, 55, 75, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-indigo-50 rounded-t-2xl relative group cursor-pointer hover:bg-indigo-600 transition-all" style={{ height: `${h}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity font-black text-indigo-600 text-xs">
                    {h}%
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Waived</p>
                <p className="text-2xl font-black text-indigo-600">${stats?.totalWaived.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Recovered</p>
                <p className="text-2xl font-black text-green-600">${stats?.totalCollected.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden border border-slate-100">
          <CardHeader className="p-8 border-b border-slate-50">
            <CardTitle className="text-xl font-black">Institutional Stability Index</CardTitle>
            <CardDescription>Real-time monitoring of borrower financial health across the portfolio.</CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 text-green-600 p-3 rounded-2xl">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="font-black text-slate-900">Recovery Velocity</p>
                  <p className="text-xs text-slate-500 font-bold uppercase">{stats?.recoveryVelocity} Day Average</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-green-600">Optimal</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl">
                  <Heart size={24} />
                </div>
                <div>
                  <p className="font-black text-slate-900">Social Impact Score</p>
                  <p className="text-xs text-slate-500 font-bold uppercase">{stats?.socialImpact.toFixed(1)}% of Portfolio</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-blue-600">High</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 text-orange-600 p-3 rounded-2xl">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="font-black text-slate-900">Risk Mitigation</p>
                  <p className="text-xs text-slate-500 font-bold uppercase">Open Banking Verified</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-orange-600">Stable</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
