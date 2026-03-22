'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Send, Sparkles, ShieldCheck, User, Bot, Loader2, ShieldAlert, Scale, Info } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface Message {
  role: 'NOVA' | 'USER';
  content: string;
}

interface AdvocacyShieldProps {
  caseId: string;
  isFeeFrozen: boolean;
  penaltyWaived: number;
  hardshipReason: string | null;
  isSME?: boolean;
}

export function AdvocacyShield({ caseId, isFeeFrozen, penaltyWaived, hardshipReason, isSME }: AdvocacyShieldProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [success, setSuccess] = useState(isFeeFrozen);
  const [aiReason, setAiReason] = useState(hardshipReason);
  const [consentGranted, setConsentGranted] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(!isFeeFrozen);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await fetchApi<any[]>(`/cases/${caseId}/chat-history`);
        if (history.length > 0) {
          setMessages(history.map(m => ({ role: m.sender as 'NOVA' | 'USER', content: m.content })));
          setConsentGranted(true);
          setShowComplianceModal(false);
        } else {
          const initialMsg = isSME 
            ? "Hi, I'm Nova. I understand your business is your life's work. If you're facing a temporary cash flow crisis, tell me your story. I can help stabilize your business by freezing fees instantly."
            : "Hi, I'm Nova. If you're facing financial hardship, tell me your story. I might be able to freeze your fees and waive penalties instantly.";
          setMessages([{ role: 'NOVA', content: initialMsg }]);
        }
      } catch (error) {
        console.error('Failed to load chat history', error);
        setMessages([{ role: 'NOVA', content: "Hi, I'm Nova. If you're facing financial hardship, tell me your story." }]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [caseId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'USER', content: userMessage }]);
    setLoading(true);

    try {
      const analysis = await fetchApi<any>(`/cases/${caseId}/chat`, {
        method: 'POST',
        body: JSON.stringify({ story: userMessage }),
      });
      
      if (analysis.hardshipDetected) {
        setMessages(prev => [...prev, { 
          role: 'NOVA', 
          content: `I've analyzed your situation: "${analysis.reason}". I've activated the Advocacy Shield for you.` 
        }]);
        setSuccess(true);
        setAiReason(analysis.reason);
        toast.success('Advocacy Shield Activated!');
        router.refresh();
      } else {
        setMessages(prev => [...prev, { 
          role: 'NOVA', 
          content: "I'm sorry to hear that, but I couldn't detect a specific qualifying hardship in your story. If you have more details about job loss or illness, please let me know." 
        }]);
      }
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.message || 'Error processing your story';
      toast.error(errorMsg);
      setMessages(prev => [...prev, { role: 'NOVA', content: `Sorry, I encountered an error: ${errorMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  if (showComplianceModal && !success) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
        <Card className="max-w-xl w-full border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-indigo-600 text-white p-10 text-center">
            <div className="bg-white/20 w-fit mx-auto p-4 rounded-3xl mb-6">
              <Scale size={40} className="text-white" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tight uppercase italic">Compliance Gateway</CardTitle>
            <CardDescription className="text-indigo-100 text-lg font-medium mt-2">
              RE3OLV Institutional Transparency & Consent
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-2 rounded-xl shrink-0"><Bot size={20} className="text-blue-600" /></div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong>AI Disclosure:</strong> You are interacting with Nova, an Artificial Intelligence facilitator. Nova is programmed to analyze financial hardship under [MFI] regulatory frameworks.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-green-50 p-2 rounded-xl shrink-0"><ShieldCheck size={20} className="text-green-600" /></div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong>Data Consent:</strong> By proceeding, you consent to the processing of your financial data and hardship story for the purpose of debt resolution. Data is stored under GDPR/FDCPA 2026 standards.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
              <input 
                type="checkbox" 
                id="consent" 
                className="w-6 h-6 rounded-lg accent-indigo-600 cursor-pointer"
                checked={consentGranted}
                onChange={(e) => setConsentGranted(e.target.checked)}
              />
              <label htmlFor="consent" className="text-sm font-black text-slate-700 cursor-pointer">
                I understand Nova is an AI and I consent to the institutional terms.
              </label>
            </div>
          </CardContent>
          <CardFooter className="p-10 pt-0">
            <Button 
              className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-lg font-black uppercase tracking-tighter shadow-xl shadow-indigo-200 disabled:opacity-50 transition-all"
              disabled={!consentGranted}
              onClick={() => setShowComplianceModal(false)}
            >
              Start Advocacy Chat
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-[2px] rounded-3xl mb-12 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="bg-white rounded-[22px] p-8">
          <div className="flex items-start gap-6">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl shadow-xl shrink-0 border border-indigo-100">
              <ShieldCheck className="text-indigo-600" size={48} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-purple-500" size={24} />
                <h3 className="font-black text-3xl tracking-tight text-gray-900">{isSME ? 'Business Stability Secured' : 'Advocacy Shield Active'}</h3>
              </div>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Nova's Analysis: <span className="italic font-semibold text-indigo-700">"{aiReason}"</span>
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 bg-green-50 px-5 py-3 rounded-2xl border border-green-100 font-bold text-green-700 shadow-sm">
                  <span className="text-lg">${penaltyWaived.toLocaleString()} Penalties Waived</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-indigo-50 px-5 py-3 rounded-2xl border border-indigo-100 font-bold text-indigo-700 shadow-sm">
                  <span className="text-lg">{isSME ? 'Cash Flow Stabilized' : '0% Interest Applied'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="mb-12 border-0 shadow-2xl overflow-hidden rounded-3xl bg-slate-50/50 backdrop-blur-sm border border-white/20">
      <CardHeader className="bg-white border-b border-slate-100 py-6 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg shadow-indigo-100">
              <Bot className="text-white" size={24} />
            </div>
            <div>
              <CardTitle className="text-2xl font-black tracking-tight text-gray-900">Nova Facilitator</CardTitle>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <CardDescription className="font-medium text-slate-500">Institutional AI Assistant</CardDescription>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <Info size={14} className="text-slate-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">AI Disclosure Active</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent 
        className="h-[400px] overflow-y-auto p-8 space-y-6 scroll-smooth"
        ref={scrollRef}
      >
        <div className="text-center mb-8">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em] bg-white w-fit mx-auto px-4 py-1 rounded-full border border-slate-50">
            All settlements facilitate by Nova (AI) are legally binding
          </p>
        </div>

        {historyLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : (
          messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex items-end gap-3 ${msg.role === 'USER' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${msg.role === 'USER' ? 'bg-slate-200' : 'bg-indigo-100'}`}>
                {msg.role === 'USER' ? <User size={18} /> : <Bot size={18} className="text-indigo-600" />}
              </div>
              <div className="relative group max-w-[80%]">
                <div className={`px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm border ${
                  msg.role === 'USER' 
                    ? 'bg-white text-slate-800 border-slate-100 rounded-br-none' 
                    : 'bg-indigo-600 text-white rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'NOVA' && (
                  <span className="absolute -bottom-4 left-0 text-[8px] font-black uppercase text-slate-400 tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                    AI-Generated Response
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex items-end gap-3">
            <div className="p-2 rounded-xl bg-indigo-100 shrink-0">
              <Bot size={18} className="text-indigo-600" />
            </div>
            <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm font-medium">Nova is analyzing...</span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-white border-t border-slate-100 p-6">
        <div className="flex w-full gap-3 relative">
          <input
            className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-[15px] focus:outline-none focus:border-indigo-500 focus:bg-white transition-all pr-16"
            placeholder="Describe your situation to Nova..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <Button 
            onClick={handleSend} 
            disabled={loading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 rounded-xl px-5 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
