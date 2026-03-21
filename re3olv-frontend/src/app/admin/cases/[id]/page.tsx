'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ShieldCheck, ShieldAlert, History, MessageSquare, Activity, ArrowLeft } from 'lucide-react';
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

interface CaseData {
  id: string;
  borrowerName: string;
  totalAmount: number;
  isFeeFrozen: boolean;
  penaltyWaived: number;
  status: string;
  hardshipReason: string | null;
  actionLogs: ActionLog[];
  chatMessages: ChatMessage[];
}

export default function CaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8 gap-2">
        <ArrowLeft size={16} /> Back to Dashboard
      </Button>

      <header className="mb-12 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">{caseData.borrowerName}</h1>
          <p className="text-lg text-slate-500 font-mono uppercase tracking-tighter mt-1">{caseData.id}</p>
        </div>
        <div className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-sm shadow-sm ${
          caseData.status === 'SETTLED' ? 'bg-green-100 text-green-700' : 
          caseData.status === 'RESOLVED' ? 'bg-indigo-100 text-indigo-700' :
          'bg-orange-100 text-orange-700'
        }`}>
          {caseData.status}
        </div>
      </header>

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
    </div>
  );
}
