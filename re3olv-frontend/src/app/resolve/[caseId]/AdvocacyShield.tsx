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
}

export function AdvocacyShield({ caseId, isFeeFrozen, penaltyWaived }: AdvocacyShieldProps) {
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState('');
  const [success, setSuccess] = useState(isFeeFrozen);
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
      <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl mb-12 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-green-100 p-3 rounded-full">
          <ShieldCheck className="text-green-600" size={32} />
        </div>
        <div>
          <h3 className="font-bold text-xl">Advocacy Shield Active</h3>
          <p className="text-green-700">The bank has waived your fees. ${penaltyWaived.toLocaleString()} in penalties have been waived.</p>
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
