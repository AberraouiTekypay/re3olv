'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ShieldAlert, ShieldCheck, PieChart, LayoutDashboard, Download, TrendingUp, Heart, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { fetchApi } from '@/lib/api-client';
import Link from 'next/link';

interface CaseData {
  id: string;
  totalAmount: number;
  status: string;
  selectedOptionId: string | null;
  isFeeFrozen: boolean;
  penaltyWaived: number;
  hardshipReason: string | null;
  createdAt: string;
}

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

export default function AgentDashboardPage() {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [stats, setStats] = useState<ROIStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'social'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [casesData, statsData] = await Promise.all([
        fetchApi<CaseData[]>('/cases'),
        fetchApi<ROIStats>('/cases/analytics/roi')
      ]);
      setCases(casesData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const exportFunderReport = () => {
    if (!stats) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text('RE3OLV Social Performance Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Summary
    doc.setFontSize(16);
    doc.text('Executive Summary', 20, 45);
    doc.setFontSize(11);
    doc.text(`Total Portfolio Managed: $${stats.totalManaged.toLocaleString()}`, 25, 55);
    doc.text(`Total Capital Recovered: $${stats.totalCollected.toLocaleString()}`, 25, 62);
    doc.text(`Total Social Impact (Debt Waived): $${stats.totalWaived.toLocaleString()}`, 25, 69);
    doc.text(`Portfolio ROI: ${stats.roi.toFixed(2)}%`, 25, 76);
    doc.text(`Social Impact Score: ${stats.socialImpact.toFixed(2)}%`, 25, 83);

    // Case Table
    doc.setFontSize(16);
    doc.text('Resolved Cases Detail', 20, 100);
    
    const tableRows = cases
      .filter(c => c.status === 'SETTLED' || c.status === 'RESOLVED')
      .map(c => [
        c.id.slice(0, 8),
        new Date(c.createdAt).toLocaleDateString(),
        `$${c.totalAmount.toLocaleString()}`,
        `$${c.penaltyWaived.toLocaleString()}`,
        c.isFeeFrozen ? 'Yes' : 'No',
        c.selectedOptionId || '-'
      ]);

    (doc as any).autoTable({
      startY: 105,
      head: [['ID', 'Date', 'Original', 'Waived', 'Frozen', 'Plan']],
      body: tableRows,
    });

    doc.save('RE3OLV_Funder_Report.pdf');
  };

  if (loading) return <div className="p-12 text-center font-mono animate-pulse">Synchronizing B2B Metrics...</div>;

  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Agent Dashboard</h1>
          <p className="text-muted-foreground mt-2 font-medium">Multi-tenant Institutional Portfolio Management</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <Button 
            variant={activeTab === 'overview' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('overview')}
            className="gap-2 rounded-xl font-bold"
          >
            <LayoutDashboard size={16} /> Overview
          </Button>
          <Button 
            variant={activeTab === 'social' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('social')}
            className="gap-2 rounded-xl font-bold"
          >
            <PieChart size={16} /> Social Impact
          </Button>
        </div>
      </header>

      {activeTab === 'overview' ? (
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-50 py-6 px-8">
            <CardTitle className="text-xl font-black">Institutional Case Registry</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="px-8 font-bold text-xs uppercase tracking-wider">Case ID</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Date</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Exposure</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Shield</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Analysis</TableHead>
                  <TableHead className="px-8 font-bold text-xs uppercase tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground italic">
                      No institutional cases assigned to this tenant.
                    </TableCell>
                  </TableRow>
                ) : (
                  cases.map((c) => (
                    <TableRow key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="px-8 py-5 font-mono text-xs font-bold text-indigo-600">
                        {c.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="py-5 text-sm text-slate-500 font-medium">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-5 font-bold text-gray-900">
                        ${c.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          c.status === 'SETTLED' ? 'bg-green-100 text-green-700' : 
                          c.status === 'RESOLVED' ? 'bg-indigo-100 text-indigo-700' : 
                          c.status === 'ADVOCACY' ? 'bg-purple-100 text-purple-700' : 
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {c.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-5">
                        {c.isFeeFrozen ? (
                          <div className="flex items-center gap-1.5 text-green-600 font-black text-[10px] uppercase tracking-tighter">
                            <ShieldCheck size={14} /> Active
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[10px] uppercase tracking-tighter">
                            <ShieldAlert size={14} /> Inactive
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-5 max-w-[150px] truncate text-xs text-slate-500 font-medium italic">
                        {c.hardshipReason || 'No interaction'}
                      </TableCell>
                      <TableCell className="px-8 py-5 text-right">
                        <Button variant="outline" size="sm" className="rounded-xl font-bold border-2 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all" asChild>
                          <Link href={`/admin/cases/${c.id}`}>Manage</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-xl rounded-3xl bg-indigo-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <LayoutDashboard size={80} />
              </div>
              <CardContent className="pt-8">
                <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Portfolio Managed</p>
                <h3 className="text-3xl font-black">${stats?.totalManaged.toLocaleString()}</h3>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white">
              <CardContent className="pt-8">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Lender ROI</p>
                    <h3 className="text-3xl font-black text-green-600">{stats?.roi.toFixed(1)}%</h3>
                  </div>
                  <div className="bg-green-50 p-2 rounded-xl">
                    <TrendingUp className="text-green-500" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white">
              <CardContent className="pt-8">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Impact Score</p>
                    <h3 className="text-3xl font-black text-blue-600">{stats?.socialImpact.toFixed(1)}%</h3>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-xl">
                    <Heart className="text-blue-500" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white">
              <CardContent className="pt-8">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Rec. Velocity</p>
                    <h3 className="text-3xl font-black text-orange-600">{stats?.recoveryVelocity} Days</h3>
                  </div>
                  <div className="bg-orange-50 p-2 rounded-xl">
                    <Activity className="text-orange-500" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 py-8 px-10">
              <div>
                <CardTitle className="text-2xl font-black">Institutional Performance Analysis</CardTitle>
                <p className="text-sm text-slate-500 font-medium">Social Performance Data & Capital Recovery Intelligence</p>
              </div>
              <Button onClick={exportFunderReport} className="gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-2xl h-12 px-6 font-bold shadow-lg shadow-indigo-100">
                <Download size={18} /> Export Funder Report
              </Button>
            </CardHeader>
            <CardContent className="p-10">
              <div className="h-[350px] flex items-center justify-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                  <Activity size={400} className="absolute -bottom-20 -right-20 text-indigo-900" />
                </div>
                <div className="text-center space-y-4 relative z-10">
                  <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200 inline-block mb-2">
                    <PieChart size={48} className="text-indigo-600" />
                  </div>
                  <p className="font-black text-2xl tracking-tight text-gray-900 uppercase italic">Analytics Engine Active</p>
                  <div className="flex gap-4 justify-center">
                    <div className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-700 font-bold text-xs uppercase">Managed: ${stats?.totalManaged.toLocaleString()}</div>
                    <div className="bg-green-50 px-4 py-2 rounded-xl text-green-700 font-bold text-xs uppercase">Recovered: ${stats?.totalCollected.toLocaleString()}</div>
                    <div className="bg-purple-50 px-4 py-2 rounded-xl text-purple-700 font-bold text-xs uppercase">Waived: ${stats?.totalWaived.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
