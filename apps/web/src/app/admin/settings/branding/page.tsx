'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Palette, Image as ImageIcon, FileText, CheckCircle, Loader2, Globe, Mail, ShieldAlert } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface BrandingData {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  legalName: string;
  supportEmail: string;
  regulatoryDisclaimer: string;
}

export default function BrandingSettingsPage() {
  const [branding, setBranding] = useState<BrandingData>({
    logoUrl: '',
    primaryColor: '#4f46e5',
    secondaryColor: '#0f172a',
    legalName: '',
    supportEmail: '',
    regulatoryDisclaimer: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const data = await fetchApi<BrandingData>('/cases/organization/branding');
      if (data) setBranding(data);
    } catch (error) {
      toast.error('Failed to load branding settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetchApi('/cases/organization/branding', {
        method: 'POST',
        body: JSON.stringify(branding),
      });
      toast.success('Institutional branding updated');
    } catch (error) {
      toast.error('Failed to save branding');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center font-mono">Loading Brand Engine...</div>;

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Brand Identity Suite</h1>
        <p className="text-slate-500 font-medium">Co-brand the resolution portal and institutional documents.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Palette className="text-indigo-600" size={24} /> Visual Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Logo Repository URL</Label>
                <div className="flex gap-4">
                  <Input 
                    value={branding.logoUrl} 
                    onChange={(e) => setBranding({...branding, logoUrl: e.target.value})}
                    placeholder="https://your-bank.com/logo.png"
                    className="rounded-xl h-12"
                  />
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                    {branding.logoUrl ? <img src={branding.logoUrl} alt="Preview" className="max-w-[80%] max-h-[80%] object-contain" /> : <ImageIcon className="text-slate-300" />}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Primary Color</Label>
                  <div className="flex gap-3">
                    <Input 
                      type="color" 
                      value={branding.primaryColor} 
                      onChange={(e) => setBranding({...branding, primaryColor: e.target.value})}
                      className="w-12 h-12 p-1 rounded-xl cursor-pointer"
                    />
                    <Input 
                      value={branding.primaryColor} 
                      onChange={(e) => setBranding({...branding, primaryColor: e.target.value})}
                      className="rounded-xl h-12 font-mono uppercase"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Secondary Color</Label>
                  <div className="flex gap-3">
                    <Input 
                      type="color" 
                      value={branding.secondaryColor} 
                      onChange={(e) => setBranding({...branding, secondaryColor: e.target.value})}
                      className="w-12 h-12 p-1 rounded-xl cursor-pointer"
                    />
                    <Input 
                      value={branding.secondaryColor} 
                      onChange={(e) => setBranding({...branding, secondaryColor: e.target.value})}
                      className="rounded-xl h-12 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Globe className="text-indigo-600" size={24} /> Legal & Support
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Institutional Legal Name</Label>
                <Input 
                  value={branding.legalName} 
                  onChange={(e) => setBranding({...branding, legalName: e.target.value})}
                  placeholder="Universal Credit Partners Ltd."
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Support Mailbox</Label>
                <Input 
                  value={branding.supportEmail} 
                  onChange={(e) => setBranding({...branding, supportEmail: e.target.value})}
                  placeholder="resolutions@universal-credit.com"
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Regulatory PDF Footer</Label>
                <Textarea 
                  value={branding.regulatoryDisclaimer} 
                  onChange={(e) => setBranding({...branding, regulatoryDisclaimer: e.target.value})}
                  placeholder="Disclosure statements for FDCPA compliance..."
                  className="rounded-2xl min-h-[100px] resize-none"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 p-8 border-t border-slate-100">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl font-black uppercase tracking-tighter gap-2"
              >
                {saving ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                {saving ? 'Synchronizing...' : 'Save Branding Protocol'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-8">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 px-4 flex items-center gap-2">
            <FileText size={14} /> Live Co-Brand Preview
          </h3>
          
          <div className="border-[12px] border-slate-900 rounded-[3rem] overflow-hidden shadow-2xl bg-white min-h-[700px] flex flex-col">
            <div className="bg-slate-100 p-8 border-b border-slate-200 flex justify-between items-center">
              {branding.logoUrl ? <img src={branding.logoUrl} alt="Logo" className="h-8" /> : <div className="font-black italic text-slate-400">INSTITUTION_LOGO</div>}
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
            </div>
            
            <div className="p-12 flex-grow space-y-8 font-serif text-slate-800 text-sm leading-relaxed">
              <div className="text-center space-y-2 mb-12">
                <h4 className="font-bold text-xl uppercase tracking-widest" style={{ color: branding.primaryColor }}>Letter of Intent</h4>
                <p className="text-xs text-slate-400 font-sans font-bold">Document ID: RE3OLV-2026-X-PREVIEW</p>
              </div>
              
              <p>To Whom It May Concern,</p>
              
              <p>
                <span className="font-bold" style={{ color: branding.primaryColor }}>{branding.legalName || 'YOUR INSTITUTION'}</span>, 
                acting as the institutional advocate for [BORROWER_NAME], hereby proposes a multi-creditor consolidation of the outstanding exposure totaling $12,450.00.
              </p>
              
              <div className="p-6 border-2 border-dashed rounded-3xl space-y-4" style={{ borderColor: branding.primaryColor + '40', backgroundColor: branding.primaryColor + '05' }}>
                <p className="font-bold uppercase tracking-widest text-[10px]" style={{ color: branding.primaryColor }}>Proposed Restructuring Terms</p>
                <div className="grid grid-cols-2 gap-4 font-sans text-xs">
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Buyout Principal</p>
                    <p className="font-black text-slate-900">$12,450.00</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Restructured Rate</p>
                    <p className="font-black text-green-600">12.0% APR</p>
                  </div>
                </div>
              </div>
              
              <p>This restructuring aims to improve debt sustainability and ensure recovery velocity across all partner nodes.</p>
              
              <div className="pt-12 border-t border-slate-100 mt-auto">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Support Email</p>
                    <p className="font-bold text-slate-900 font-sans">{branding.supportEmail || 'support@re3olv.ai'}</p>
                  </div>
                  <div className="w-32 h-12 border-b-2 border-slate-900 flex items-center justify-center font-cursive italic text-slate-400 text-xs">
                    Digitally Signed
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-6 text-[9px] font-bold text-slate-400 leading-tight uppercase text-center border-t border-slate-100">
              {branding.regulatoryDisclaimer}
            </div>
          </div>

          <Card className="bg-indigo-600 text-white border-0 shadow-xl rounded-3xl p-6 flex items-start gap-4">
            <ShieldAlert size={24} className="text-indigo-200 flex-shrink-0" />
            <p className="text-xs font-medium leading-relaxed">
              Updating these settings will immediately re-brand the <span className="font-bold underline">Nova Resolution Portal</span>, the <span className="font-bold underline">Consumer Debt Dashboard</span>, and all <span className="font-bold underline">generated PDF agreements</span> for your organization.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
