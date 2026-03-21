'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink, ShieldCheck, User as UserIcon, Link as LinkIcon, Copy, MessageSquare } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface CaseData {
  id: string;
  borrowerName: string;
  totalAmount: number;
  status: string;
  viewCount: number;
  lastViewedAt: string | null;
}

export default function AlphaLaunchpad() {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await fetchApi<CaseData[]>('/cases');
      setCases(data);
    } catch (error) {
      console.error('Failed to fetch cases', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAndCopyNudge = async (c: CaseData) => {
    try {
      const { url } = await fetchApi<{ url: string }>(`/cases/${c.id}/magic-link`);
      const message = `Hi ${c.borrowerName}, I'm Nova, your RE3OLV Advocate. I've been reviewing your account with [MFI] and I think I can get some of your late fees waived. Can we chat? ${url}`;
      await navigator.clipboard.writeText(message);
      toast.success(`WhatsApp nudge copied for ${c.borrowerName}!`);
    } catch (error) {
      toast.error('Failed to generate magic link');
    }
  };

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
                <TableHead className="px-10 py-5 font-bold text-slate-700 uppercase tracking-wider text-xs">Borrower</TableHead>
                <TableHead className="py-5 font-bold text-slate-700 uppercase tracking-wider text-xs">Total Debt</TableHead>
                <TableHead className="py-5 font-bold text-slate-700 uppercase tracking-wider text-xs">Tracking</TableHead>
                <TableHead className="py-5 font-bold text-slate-700 uppercase tracking-wider text-xs">Status</TableHead>
                <TableHead className="px-10 py-5 font-bold text-slate-700 uppercase tracking-wider text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((c) => (
                <TableRow key={c.id} className="hover:bg-indigo-50/50 transition-colors">
                  <TableCell className="px-10 py-6">
                    <p className="font-bold text-gray-900">{c.borrowerName}</p>
                    <p className="font-mono text-[10px] text-slate-400 uppercase">{c.id.slice(0, 12)}</p>
                  </TableCell>
                  <TableCell className="py-6 font-black text-indigo-700 text-lg">${c.totalAmount.toLocaleString()}</TableCell>
                  <TableCell className="py-6">
                    {c.viewCount > 0 ? (
                      <div className="flex flex-col">
                        <span className="text-green-600 font-bold flex items-center gap-1 text-xs">
                          <ExternalLink size={12} /> {c.viewCount} Opens
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {c.lastViewedAt ? new Date(c.lastViewedAt).toLocaleTimeString() : ''}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-300 font-medium text-xs italic">Never Opened</span>
                    )}
                  </TableCell>
                  <TableCell className="py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      c.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 
                      c.status === 'SETTLED' ? 'bg-emerald-600 text-white' :
                      c.status === 'ADVOCACY' ? 'bg-purple-100 text-purple-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {c.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-10 py-6 text-right flex justify-end gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl font-bold border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                      onClick={() => generateAndCopyNudge(c)}
                    >
                      <MessageSquare size={14} className="mr-2" /> Nudge
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl font-bold bg-white hover:bg-slate-50 border-2" asChild>
                      <a href={`/resolve/${c.id}`} target="_blank" rel="noopener noreferrer">
                        Portal <ExternalLink size={14} className="ml-2" />
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
