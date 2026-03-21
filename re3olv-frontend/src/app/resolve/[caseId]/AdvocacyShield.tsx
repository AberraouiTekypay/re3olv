'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Send, Sparkles, ShieldCheck } from 'lucide-react';

interface AdvocacyShieldProps {
  caseId: string;
  isFeeFrozen: boolean;
  penaltyWaived: number;
  hardshipReason: string | null;
}

export function AdvocacyShield({ caseId, isFeeFrozen, penaltyWaived, hardshipReason }: AdvocacyShieldProps) {
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState('');
  const [success, setSuccess] = useState(isFeeFrozen);
  const [aiReason, setAiReason] = useState(hardshipReason);
  const router = useRouter();

  const handleSendMessage = async () => {
    if (!story.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/cases/${caseId}/hardship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story }),
      });
      if (!res.ok) throw new Error('Failed to process story');
      
      const analysis = await res.json();
      if (analysis.hardshipDetected) {
        setSuccess(true);
        setAiReason(analysis.reason);
        router.refresh();
      } else {
        alert('Advocacy not triggered. Please provide more details if you are facing hardship.');
      }
    } catch (error) {
      console.error(error);
      alert('Error processing your story');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-900 p-8 rounded-3xl mb-12 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-start gap-6">
          <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-200 shrink-0">
            <ShieldCheck className="text-white" size={40} />
          </div>
          <div>
            <h3 className="font-extrabold text-2xl tracking-tight mb-2">Advocacy Shield Active</h3>
            <p className="text-indigo-700 text-lg mb-4">
              Nova detected: <span className="italic font-medium text-indigo-900">"{aiReason}"</span>
            </p>
            <div className="inline-flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-indigo-100 font-semibold text-indigo-800">
              <Sparkles size={16} className="text-indigo-500" /> ${penaltyWaived.toLocaleString()} in penalties waived & 0% interest applied
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="mb-12 border-2 border-primary/20 shadow-xl overflow-hidden rounded-2xl">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" size={20} />
          <CardTitle className="text-lg">Nova Advocacy Brain</CardTitle>
        </div>
        <CardDescription>Tell us your story. If you're facing hardship, we'll fight to waive your fees instantly.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <textarea
          className="w-full min-h-[120px] p-4 rounded-xl border-2 border-muted bg-muted/30 focus:border-primary focus:ring-0 transition-all resize-none"
          placeholder="e.g., I recently lost my job and I'm struggling to keep up with bills..."
          value={story}
          onChange={(e) => setStory(e.target.value)}
          disabled={loading}
        />
      </CardContent>
      <CardFooter className="bg-muted/30 p-4 flex justify-end gap-2">
        <Button 
          onClick={handleSendMessage} 
          disabled={loading || !story.trim()}
          className="rounded-full px-6 gap-2"
        >
          {loading ? 'Analyzing...' : (
            <>
              Send to Nova <Send size={16} />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
