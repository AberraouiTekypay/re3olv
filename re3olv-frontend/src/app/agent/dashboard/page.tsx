'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ShieldAlert, ShieldCheck, PieChart, LayoutDashboard, Download, TrendingUp, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
  resolvedCount: number;
  totalCases: number;
  roi: number;
  socialImpact: number;
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
      const [casesRes, statsRes] = await Promise.all([
        fetch('http://localhost:3001/api/cases'),
        fetch('http://localhost:3001/api/cases/analytics/roi')
      ]);
      const casesData = await casesRes.json();
      const statsData = await statsRes.json();
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
      .filter(c => c.status === 'RESOLVED')
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

  if (loading) return <div className="p-12 text-center">Loading B2B Analytics...</div>;

  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
          <p className="text-muted-foreground mt-2">B2B Case Management & Impact Analytics</p>
        </div>
        <div className="flex gap-2 bg-muted p-1 rounded-lg">
          <Button 
            variant={activeTab === 'overview' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('overview')}
            className="gap-2"
          >
            <LayoutDashboard size={16} /> Overview
          </Button>
          <Button 
            variant={activeTab === 'social' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('social')}
            className="gap-2"
          >
            <PieChart size={16} /> Social Impact
          </Button>
        </div>
      </header>

      {activeTab === 'overview' ? (
        <Card>
          <CardHeader>
            <CardTitle>Case Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Advocacy Shield</TableHead>
                  <TableHead>Hardship Reason</TableHead>
                  <TableHead>Selected Plan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No cases found.
                    </TableCell>
                  </TableRow>
                ) : (
                  cases.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">{c.id.slice(0, 8)}...</TableCell>
                      <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>${c.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          c.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 
                          c.status === 'ADVOCACY' ? 'bg-purple-100 text-purple-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {c.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {c.isFeeFrozen ? (
                          <div className="flex items-center gap-1 text-green-600 font-medium">
                            <ShieldCheck size={16} /> Active (-${c.penaltyWaived})
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <ShieldAlert size={16} /> Inactive
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={c.hardshipReason || ''}>
                        {c.hardshipReason || '-'}
                      </TableCell>
                      <TableCell>
                        {c.selectedOptionId ? (
                          <span className="capitalize">{c.selectedOptionId.replace('-', ' ')}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-indigo-600 text-white">
              <CardContent className="pt-6">
                <p className="text-sm opacity-80 mb-1">Total Managed</p>
                <h3 className="text-2xl font-bold">${stats?.totalManaged.toLocaleString()}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Lender ROI</p>
                    <h3 className="text-2xl font-bold text-green-600">{stats?.roi.toFixed(1)}%</h3>
                  </div>
                  <TrendingUp className="text-green-500" size={24} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Social Impact</p>
                    <h3 className="text-2xl font-bold text-purple-600">${stats?.totalWaived.toLocaleString()}</h3>
                  </div>
                  <Heart className="text-purple-500" size={24} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Impact Score</p>
                    <h3 className="text-2xl font-bold text-blue-600">{stats?.socialImpact.toFixed(1)}%</h3>
                  </div>
                  <ShieldCheck className="text-blue-500" size={24} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Funder ROI Analysis</CardTitle>
                <p className="text-sm text-muted-foreground">Deep dive into social performance and capital recovery metrics.</p>
              </div>
              <Button onClick={exportFunderReport} className="gap-2">
                <Download size={16} /> Export Funder Report
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-xl border-2 border-dashed border-muted">
                <div className="text-center space-y-2">
                  <PieChart size={48} className="mx-auto text-muted-foreground/50" />
                  <p className="font-medium text-muted-foreground">ROI Visualization Engine Active</p>
                  <p className="text-xs text-muted-foreground/60">Managed: ${stats?.totalManaged.toLocaleString()} | Recovered: ${stats?.totalCollected.toLocaleString()} | Waived: ${stats?.totalWaived.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
