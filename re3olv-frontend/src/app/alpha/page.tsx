'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink, ShieldCheck, User as UserIcon } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

interface CaseData {
  id: string;
  borrowerName: string;
  totalAmount: number;
  status: string;
}

export default function AlphaLaunchpad() {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<CaseData[]>('/cases')
      .then(data => {
        setCases(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch cases', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-12 text-center font-mono">Loading Launchpad...</div>;

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <header className="mb-12 border-b border-indigo-100 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">Alpha Launchpad</h1>
        </div>
        <p className="text-lg text-slate-500 font-medium">Stress Test & QA Environment for RE3OLV 1.0</p>
      </header>

      <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/50 backdrop-blur-md">
        <CardHeader className="bg-white/80 border-b border-slate-100 py-8 px-10">
          <CardTitle className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <UserIcon className="text-indigo-500" size={24} /> Test Data: Case Registry
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="px-10 py-5 font-bold text-slate-700 uppercase tracking-wider text-xs">Case ID</TableHead>
                <TableHead className="py-5 font-bold text-slate-700 uppercase tracking-wider text-xs">Borrower</TableHead>
                <TableHead className="py-5 font-bold text-slate-700 uppercase tracking-wider text-xs">Total Debt</TableHead>
                <TableHead className="py-5 font-bold text-slate-700 uppercase tracking-wider text-xs">Status</TableHead>
                <TableHead className="px-10 py-5 font-bold text-slate-700 uppercase tracking-wider text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((c) => (
                <TableRow key={c.id} className="hover:bg-indigo-50/50 transition-colors">
                  <TableCell className="px-10 py-6 font-mono text-xs text-indigo-600 font-bold">{c.id.slice(0, 18)}...</TableCell>
                  <TableCell className="py-6 font-bold text-gray-900">{c.borrowerName}</TableCell>
                  <TableCell className="py-6 font-black text-indigo-700 text-lg">${c.totalAmount.toLocaleString()}</TableCell>
                  <TableCell className="py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      c.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 
                      c.status === 'ADVOCACY' ? 'bg-purple-100 text-purple-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {c.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-10 py-6 text-right flex justify-end gap-3">
                    <Button variant="outline" size="sm" className="rounded-xl font-bold bg-white hover:bg-slate-50 border-2" asChild>
                      <a href={`http://localhost:3000/resolve/${c.id}`} target="_blank" rel="noopener noreferrer">
                        Portal <ExternalLink size={14} className="ml-2" />
                      </a>
                    </Button>
                    <Button size="sm" className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100" asChild>
                      <a href="/agent/dashboard">
                        Agent View
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <footer className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-6 py-3 rounded-2xl border border-indigo-100 font-bold">
          <ShieldCheck size={20} /> Total Active Alpha Cases: {cases.length}
        </div>
      </footer>
    </div>
  );
}
