'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, CreditCard, Building2, Landmark, ShieldCheck, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface RegionConfig {
  countryCode: string;
  activeAdapters: any;
  complianceRules: any;
}

export default function RegionDetailSettingsPage() {
  const { countryCode } = useParams();
  const router = useRouter();
  const [config, setConfig] = useState<RegionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [countryCode]);

  const fetchConfig = async () => {
    try {
      const data = await fetchApi<any>(`/cases/regions/${countryCode}/config`);
      if (data) {
        setConfig({
          countryCode: data.countryCode,
          activeAdapters: data.activeAdapters ? JSON.parse(data.activeAdapters) : { CREDIT: 'Experian', PAYMENTS: 'Stripe', ERP: 'SAP', BANKING: 'Plaid' },
          complianceRules: data.complianceRules ? JSON.parse(data.complianceRules) : { maxInterest: 15, disclosureText: '', currency: 'USD' },
        });
      } else {
        // Default for new region
        setConfig({
          countryCode: countryCode as string,
          activeAdapters: { CREDIT: 'Experian', PAYMENTS: 'Stripe', ERP: 'SAP', BANKING: 'Plaid' },
          complianceRules: { maxInterest: 15, disclosureText: '', currency: 'USD' },
        });
      }
    } catch (error) {
      toast.error('Failed to load regional configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetchApi(`/cases/regions/${countryCode}/config`, {
        method: 'POST',
        body: JSON.stringify(config),
      });
      toast.success(`Regional protocol for ${countryCode} updated`);
    } catch (error) {
      toast.error('Failed to save regional configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center font-mono">Synchronizing Regional Protocol...</div>;
  if (!config) return <div className="p-12 text-center">Protocol not found.</div>;

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="gap-2 mb-4">
            <ArrowLeft size={16} /> Back to Regions
          </Button>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 flex items-center gap-3">
            <Globe className="text-indigo-600" size={36} /> {config.countryCode} Command Center
          </h1>
          <p className="text-slate-500 font-medium">Configure localized adapters and regulatory rules for this jurisdiction.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-2xl font-black uppercase tracking-tighter gap-2 shadow-xl shadow-indigo-100">
          {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          {saving ? 'Deploying...' : 'Deploy Protocol'}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card className="border-0 shadow-xl rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <CreditCard className="text-indigo-600" size={24} /> Payment Gateway
              </CardTitle>
              <CardDescription>Select the active merchant of record for this region.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Active Provider</Label>
                <div className="grid grid-cols-2 gap-4">
                  {['Stripe', 'CMI', 'Paystack', 'Flutterwave'].map(p => (
                    <Button 
                      key={p} 
                      variant={config.activeAdapters.PAYMENTS === p ? 'default' : 'outline'}
                      className="h-14 rounded-2xl font-bold"
                      onClick={() => setConfig({...config, activeAdapters: {...config.activeAdapters, PAYMENTS: p}})}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Building2 className="text-indigo-600" size={24} /> ERP Connector
              </CardTitle>
              <CardDescription>Institutional Ledger Sync (Case Ingestion).</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Active ERP System</Label>
                <div className="grid grid-cols-2 gap-4">
                  {['SAP', 'Oracle', 'MS Dynamics', 'Sage'].map(p => (
                    <Button 
                      key={p} 
                      variant={config.activeAdapters.ERP === p ? 'default' : 'outline'}
                      className="h-14 rounded-2xl font-bold"
                      onClick={() => setConfig({...config, activeAdapters: {...config.activeAdapters, ERP: p}})}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-0 shadow-xl rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Landmark className="text-indigo-600" size={24} /> Local Legal & Currency
              </CardTitle>
              <CardDescription>Localized compliance rules and fiscal formatting.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Currency Symbol</Label>
                <Input 
                  value={config.complianceRules.currency} 
                  onChange={(e) => setConfig({...config, complianceRules: {...config.complianceRules, currency: e.target.value}})}
                  placeholder="MAD, GBP, EUR"
                  className="rounded-xl h-12 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Max Legal Interest (%)</Label>
                <Input 
                  type="number"
                  value={config.complianceRules.maxInterest} 
                  onChange={(e) => setConfig({...config, complianceRules: {...config.complianceRules, maxInterest: parseInt(e.target.value)}})}
                  className="rounded-xl h-12"
                />
              </div>
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <div className="flex items-center gap-2 text-orange-700 font-bold text-xs mb-2">
                  <ShieldCheck size={14} /> Regulatory Safeguard
                </div>
                <p className="text-[10px] text-orange-600 leading-relaxed font-medium">
                  Nova AI will automatically cap proposed settlement interests at {config.complianceRules.maxInterest}% to remain compliant with {config.countryCode} usury laws.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl rounded-[2rem] bg-slate-900 text-white p-8">
            <h4 className="text-sm font-black uppercase tracking-widest mb-4">Deployment Status</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Gateway Status</span>
                <span className="text-xs font-black text-green-400 uppercase">Live</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">ERP Handshake</span>
                <span className="text-xs font-black text-indigo-400 uppercase">Authenticated</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Compliance Logic</span>
                <span className="text-xs font-black text-white uppercase">v2.4-stable</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
