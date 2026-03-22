'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, ShieldCheck, Zap, AlertCircle, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface Provider {
  id: string;
  countryCode: string;
  category: string;
  providerName: string;
}

const COUNTRIES = [
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
];

export default function RegionalSettingsPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const all = await fetchApi<Provider[]>('/cases/providers');
      setProviders(all);
      // For demo, we'll assume a specific set are active or fetch them
      // In a real app, we'd fetch the active ones from the organization
      setActiveIds(all.slice(0, 3).map(p => p.id));
    } catch (error) {
      toast.error('Failed to load regional providers');
    } finally {
      setLoading(false);
    }
  };

  const toggleProvider = async (id: string) => {
    setTogglingId(id);
    const isActive = activeIds.includes(id);
    try {
      await fetchApi(`/cases/providers/${id}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ active: !isActive }),
      });
      
      if (isActive) {
        setActiveIds(activeIds.filter(aid => aid !== id));
        toast.success('Provider deactivated for your region');
      } else {
        setActiveIds([...activeIds, id]);
        toast.success('Provider successfully connected');
      }
    } catch (error) {
      toast.error('Failed to toggle provider');
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) return <div className="p-12 text-center font-mono">Synchronizing Regional Nodes...</div>;

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Regional Control Center</h1>
        <p className="text-slate-500 font-medium">Orchestrate data providers and compliance protocols per geography.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="border-0 shadow-xl rounded-[2rem] bg-indigo-600 text-white p-6">
          <Globe size={32} className="mb-4 opacity-50" />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Global Reach</p>
          <h3 className="text-3xl font-black">4 Regions</h3>
          <p className="text-xs font-bold mt-2 text-indigo-200">UK, Spain, France, Morocco</p>
        </Card>
        <Card className="border-0 shadow-xl rounded-[2rem] bg-white p-6 border border-slate-100">
          <Zap size={32} className="mb-4 text-orange-500" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fallback Nodes</p>
          <h3 className="text-3xl font-black text-slate-900">Active</h3>
          <p className="text-xs font-bold mt-2 text-slate-500 italic">Auto-trigger Proxy in Morocco</p>
        </Card>
        <Card className="border-0 shadow-xl rounded-[2rem] bg-white p-6 border border-slate-100">
          <ShieldCheck size={32} className="mb-4 text-green-600" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Compliance</p>
          <h3 className="text-3xl font-black text-slate-900">FDCPA + GDPR</h3>
          <p className="text-xs font-bold mt-2 text-slate-500 uppercase">Audit Ready</p>
        </Card>
      </div>

      <div className="space-y-12">
        {COUNTRIES.map((country) => (
          <section key={country.code}>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">{country.flag}</span>
              <div>
                <h2 className="text-2xl font-black text-slate-900">{country.name}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{country.code} Jurisdiction</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.filter(p => p.countryCode === country.code).map((provider) => {
                const isActive = activeIds.includes(provider.id);
                return (
                  <Card key={provider.id} className={`border-2 rounded-3xl transition-all ${isActive ? 'border-indigo-600 shadow-lg' : 'border-slate-100 opacity-60'}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-50 p-2 rounded-xl">
                          <Zap size={20} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                        </div>
                        <Button 
                          variant={isActive ? 'destructive' : 'default'} 
                          size="sm"
                          className="rounded-full h-8 px-4 font-black uppercase text-[10px] tracking-widest"
                          disabled={togglingId === provider.id}
                          onClick={() => toggleProvider(provider.id)}
                        >
                          {togglingId === provider.id ? <Loader2 className="animate-spin" size={12} /> : (isActive ? 'Disconnect' : 'Connect')}
                        </Button>
                      </div>
                      <h4 className="font-black text-slate-900">{provider.providerName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{provider.category} Engine</p>
                      
                      <div className="mt-6 flex items-center gap-2">
                        {isActive ? (
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-green-600 uppercase">
                            <CheckCircle2 size={12} /> Live API Link
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-300 uppercase">
                            <XCircle size={12} /> Inactive
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {country.code === 'MA' && (
                <Card className="border-2 border-dashed border-orange-200 rounded-3xl bg-orange-50/30">
                  <CardContent className="p-6">
                    <div className="bg-orange-100 p-2 rounded-xl w-fit mb-4">
                      <AlertCircle size={20} className="text-orange-600" />
                    </div>
                    <h4 className="font-black text-orange-900 uppercase text-xs mb-1">Adaptive Fallback</h4>
                    <p className="text-[10px] font-bold text-orange-700/60 leading-relaxed">
                      If Official Data is unavailable, Nova will automatically transition to 'Cash-Flow Proxy' mode for this region.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
