'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, FileImage, Smartphone, CheckCircle, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface EvidenceItem {
  id: string;
  type: string;
  name: string;
  preview?: string;
}

export function EvidenceDrawer({ caseId }: { caseId: string }) {
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const addEvidence = (type: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newItem = { id, type, name: `${type}_${items.length + 1}.jpg` };
    setItems([...items, newItem]);
    toast.success(`${type} recorded for proxy verification`);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-white overflow-hidden mt-8 border-2 border-dashed border-indigo-100">
      <CardHeader className="bg-indigo-50/50 p-8 border-b border-indigo-100">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-black text-indigo-900">Evidence Drawer</CardTitle>
            <CardDescription className="text-indigo-600 font-medium italic">Alternative 'Shadow' Data for Emerging Market Verification</CardDescription>
          </div>
          <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            CASH_FLOW_PROXY ACTIVE
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Button 
            variant="outline" 
            className="h-32 flex flex-col gap-3 rounded-3xl border-2 border-indigo-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
            onClick={() => addEvidence('Manual Ledger')}
          >
            <div className="bg-indigo-100 p-3 rounded-2xl group-hover:bg-white transition-colors">
              <Camera className="text-indigo-600" size={24} />
            </div>
            <span className="font-bold text-slate-700">Manual Ledger</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-32 flex flex-col gap-3 rounded-3xl border-2 border-indigo-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
            onClick={() => addEvidence('Supplier Receipt')}
          >
            <div className="bg-indigo-100 p-3 rounded-2xl group-hover:bg-white transition-colors">
              <FileImage className="text-indigo-600" size={24} />
            </div>
            <span className="font-bold text-slate-700">Supplier Receipt</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-32 flex flex-col gap-3 rounded-3xl border-2 border-indigo-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
            onClick={() => addEvidence('Mobile Money')}
          >
            <div className="bg-indigo-100 p-3 rounded-2xl group-hover:bg-white transition-colors">
              <Smartphone className="text-indigo-600" size={24} />
            </div>
            <span className="font-bold text-slate-700">MPesa/Wave Capture</span>
          </Button>
        </div>

        {items.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Uploaded Artifacts</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {items.map((item) => (
                <div key={item.id} className="relative group aspect-square bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center p-4 text-center">
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity border border-red-50"
                  >
                    <X size={14} />
                  </button>
                  <CheckCircle size={32} className="text-green-500 mb-2" />
                  <p className="text-[10px] font-bold text-slate-600 uppercase break-all">{item.name}</p>
                </div>
              ))}
            </div>
            <Button className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-tighter gap-2 shadow-xl shadow-indigo-100">
              {uploading ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
              Finalize Proxy Submission
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
