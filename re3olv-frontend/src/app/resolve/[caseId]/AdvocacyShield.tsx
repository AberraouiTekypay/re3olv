'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Send, Sparkles, ShieldCheck, User, Bot, Loader2 } from 'lucide-react';

interface Message {
  role: 'nova' | 'user';
  content: string;
}

interface AdvocacyShieldProps {
  caseId: string;
  isFeeFrozen: boolean;
  penaltyWaived: number;
  hardshipReason: string | null;
}

export function AdvocacyShield({ caseId, isFeeFrozen, penaltyWaived, hardshipReason }: AdvocacyShieldProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'nova', content: "Hi, I'm Nova. If you're facing financial hardship, tell me your story. I might be able to freeze your fees and waive penalties instantly." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(isFeeFrozen);
  const [aiReason, setAiReason] = useState(hardshipReason);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:3001/api/cases/${caseId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: userMessage }),
      });

      if (!res.ok) throw new Error('Failed to process story');
      
      const analysis = await res.json();
      
      if (analysis.hardshipDetected) {
        setMessages(prev => [...prev, { 
          role: 'nova', 
          content: `I've analyzed your situation: "${analysis.reason}". I've activated the Advocacy Shield for you.` 
        }]);
        setSuccess(true);
        setAiReason(analysis.reason);
        router.refresh();
      } else {
        setMessages(prev => [...prev, { 
          role: 'nova', 
          content: "I'm sorry to hear that, but I couldn't detect a specific qualifying hardship in your story. If you have more details about job loss or illness, please let me know." 
        }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'nova', content: "I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-[2px] rounded-3xl mb-12 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="bg-white rounded-[22px] p-8">
          <div className="flex items-start gap-8">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-2xl shadow-xl shadow-indigo-200 shrink-0">
              <ShieldCheck className="text-white" size={48} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-purple-500" size={24} />
                <h3 className="font-black text-3xl tracking-tight text-gray-900">Advocacy Shield Active</h3>
              </div>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Nova's Analysis: <span className="italic font-semibold text-indigo-700">"{aiReason}"</span>
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 bg-green-50 px-5 py-3 rounded-2xl border border-green-100 font-bold text-green-700 shadow-sm">
                  <span className="text-lg">${penaltyWaived.toLocaleString()} Penalties Waived</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-indigo-50 px-5 py-3 rounded-2xl border border-indigo-100 font-bold text-indigo-700 shadow-sm">
                  <span className="text-lg">0% Interest Applied</span>
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
              <CardTitle className="text-2xl font-black tracking-tight text-gray-900">Nova</CardTitle>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <CardDescription className="font-medium text-slate-500">Advocacy Intelligence</CardDescription>
              </div>
            </div>
          </div>
          <Sparkles className="text-indigo-400 opacity-50" size={32} />
        </div>
      </CardHeader>
      
      <CardContent 
        className="h-[400px] overflow-y-auto p-8 space-y-6 scroll-smooth"
        ref={scrollRef}
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-indigo-100'}`}>
              {msg.role === 'user' ? <User size={18} /> : <Bot size={18} className="text-indigo-600" />}
            </div>
            <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm border ${
              msg.role === 'user' 
                ? 'bg-white border-slate-100 rounded-br-none' 
                : 'bg-indigo-600 text-white border-indigo-500 rounded-bl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
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
